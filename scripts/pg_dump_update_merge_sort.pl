#!/usr/bin/env perl
# pg_dump_update_merge_sort
#
# Copyright (c) 2025 swerder https://github.com/swerder/pg_dump_update_merge_sort
# This software is released under the MIT License.

use strict;
use warnings;
use Getopt::Long qw(:config posix_default no_ignore_case gnu_compat);
use File::Temp qw(tempdir);
use Carp qw(confess);
use Data::Dumper;

local $SIG{__DIE__} = \&confess;

my $TOKEN = q{(?:[^"'\s]+|"(?:[^"]+|"")*"|'(?:[^']+|'')*')};
my $LINE_COMMENT = '^--.*$';
my $LINE_BLANK = '^$';
my $LINE_PSQL_COMMAND = '^\\.*$';
my $LINE_SINGLE = "(?:$LINE_COMMENT|$LINE_BLANK|$LINE_PSQL_COMMAND)";
my $LINE_SQL = "^(?:$TOKEN|\\s+)*;\\s*";
my $PGIDENT = '(?:\w+|"(?:[^"]+|"")+")';
my $PGTABLE = "$PGIDENT\\\.$PGIDENT";
my $PGCOL = $PGIDENT;

my $NUMERIC_SORT_COL_TYPES = { map { $_ => 1 } qw(smallint integer bigint decimal numeric real double) };
my $TIMESTAMP_COL_TYPES = { map { $_ => 1 } qw(timestamp timestamptz date time) };

my $opts = { debug => 0 };
GetOptions($opts, qw(help|h debug|d)) or do {
    usage();
    die("Error: cannot parse command line arguments\n");
};
if ($opts->{help}) {
    usage();
    exit;
}
dp('parse opts', { opts => $opts });

my ($dump1_file, $dump2_file) = @ARGV;
unless ($dump1_file && $dump2_file) {
    usage();
    die("Error: Please provide two dump files as input.\n");
}

dp('input files', { dump1 => $dump1_file, dump2 => $dump2_file });

my $tmpdir = tempdir(CLEANUP => 1);
dp('make tmpdir', { tmpdir => $tmpdir });
mkdir("$tmpdir/dump1");
mkdir("$tmpdir/dump2");

my %data_by_table1;
extract($dump1_file, \%data_by_table1, "dump1");

my $chunks2 = [];
my $schema = {};
analyze($dump2_file, $chunks2, "dump2");

dp('analyzed', { chunks1 => \%data_by_table1, chunks2 => $chunks2, schema => $schema });
merge_and_recombine();

exit;

sub usage {
    print <<EOF;
programm to merge 2 postgress dump files, and reuse dump1 lines if only timestamp fields are changed
Usage:
  pg_dump_update_merge_sort [DUMP_FILE_1] [DUMP_FILE_2]
EOF
}

sub get_chunk_file {
    my ($chunk) = @_;
    return "$tmpdir/$chunk->{source}/$chunk->{id}.$chunk->{type}";
}

# @return {hashRef} chunk data
#     id    : chunk id
#     fh    : chunk file handle
#     type  : chunk type ('normal' or 'copy')
#     table : table name (only in copy type)
#     source: chunk file source
sub new_chunk {
    my ($params) = @_;
    open(my $fh, '>', get_chunk_file($params)) or die;
    my $chunk = { %$params, fh => $fh };
    return $chunk;
}

sub close_chunk {
    my ($chunk) = @_;
    close($chunk->{fh}) or die;
    $chunk->{fh} = undef;
}

sub switch_chunk {
    my ($old_chunk, $new_params) = @_;
    $new_params->{id}  = $old_chunk->{id} + 1;
    close_chunk($old_chunk);
    return new_chunk($new_params);
}

sub write_chunk {
    my ($chunk, $buf) = @_;
    my $fh = $chunk->{fh};
    print $fh $buf;
}


sub extract {
    my ($file, $data_by_table, $source) = @_;
    open(my $fh, '<', $file) or die("Error: Cannot open file '$file': $!\n");

    my $chunk = new_chunk({ id => 1, type => 'normal', source => $source });

    while (my $buf = <$fh>) {
        # multi line
        unless ($buf =~ /$LINE_SINGLE/o || $buf =~ /$LINE_SQL/o) {
            while (<$fh>) {
                $buf .= $_;
                last if ($buf =~ /$LINE_SQL/o);
            }
        }

        my $res = analyze_buf($buf);

        if ($buf =~ /^COPY ($PGTABLE) \(.*\)/o) {
            my $table = $1;
            $chunk = switch_chunk($chunk, { type => 'copy', table => $table, source => $source });
            $data_by_table->{$table} = $chunk;

            # copy block
            while (<$fh>) {
                if (/^\\\./) {
                    last;
                } else {
                    write_chunk($chunk, $_);
                }
            }
        }
    }

    close_chunk($chunk);
    close($fh);
}

sub analyze {
    my ($file, $chunks, $source) = @_;
    open(my $fh, '<', $file) or die("Error: Cannot open file '$file': $!\n");

    my $chunk = new_chunk({ id => 0, type => 'normal', source => $source });
    push @{$chunks}, $chunk;

    while (my $buf = <$fh>) {
        # multi line
        unless ($buf =~ /$LINE_SINGLE/o || $buf =~ /$LINE_SQL/o) {
            while (<$fh>) {
                $buf .= $_;
                last if ($buf =~ /$LINE_SQL/o);
            }
        }

        my $res = analyze_buf($buf);
        write_chunk($chunk, $buf);

        if ($res->{is_copy}) {
            $chunk = switch_chunk($chunk, { type => 'copy', table => $res->{table}, source => $source });
            push @{$chunks}, $chunk;

            # copy block
            while (<$fh>) {
                if (/^\\\./) {
                    $chunk = switch_chunk($chunk, { type => 'normal', source => $source });
                    push @{$chunks}, $chunk;
                    write_chunk($chunk, $_);
                    last;
                } else {
                    write_chunk($chunk, $_);
                }
            }
        }
    }

    close_chunk($chunk);
    close($fh);
}

sub analyze_buf {
    my ($buf) = @_;
    return analyze_create_table($buf)
        || analyze_copy($buf)
        || analyze_pkey($buf)
        || analyze_uniq($buf)
        || {};
}

sub analyze_create_table {
    my ($buf) = @_;
    return unless $buf =~ /^CREATE TABLE ($PGTABLE) \(/o;
    my $table = $1;
    my %cols = map {
        if (/^ +($PGCOL) (\w+)/o) {
            my ($col, $col_type) = ($1, $2);
            ( $col => { col_type => $col_type } );
        } else {
            ();
        }
    } split(/\n/, $buf);
    $schema->{$table}->{cols} = \%cols;
    $schema->{$table}->{table} = $table;
    return {};
}

sub analyze_copy {
    my ($buf) = @_;
    return unless $buf =~ /^COPY ($PGTABLE) \((.*)\)/o;
    my ($table, $cols_buf) = ($1, $2);
    $schema->{$table}->{copy_cols} = [split(/, /, $cols_buf)];
    return { is_copy => 1, table => $table };
}

sub analyze_pkey {
    my ($buf) = @_;
    return unless $buf =~ /^ALTER TABLE ONLY ($PGTABLE)\n.* ADD CONSTRAINT $PGCOL PRIMARY KEY \((.*)\)/o;
    my ($table, $cols_buf) = ($1, $2);
    $schema->{$table}->{pkey} = [split(/, /, $cols_buf)];
    return {};
}

sub analyze_uniq {
    my ($buf) = @_;
    return unless $buf =~ /^ALTER TABLE ONLY ($PGTABLE)\n.* ADD CONSTRAINT $PGCOL UNIQUE \((.*)\)/o;
    my ($table, $cols_buf) = ($1, $2);
    push @{$schema->{$table}->{uniqs}}, [split(/, /, $cols_buf)];
    return {};
}

sub merge_and_recombine {
    for my $chunk2 (@$chunks2) {
        open(my $fh2, get_chunk_file($chunk2)) or die;

        if ($chunk2->{type} eq 'copy') {
			my $table = $chunk2->{table};
	        my $chunk1 = $data_by_table1{$table};
            if ($chunk1 && $chunk1->{type} eq 'copy') {
                dp ("copy", {chunk1 => $chunk1, chunk2 => $chunk2, table => $table});
		        open(my $fh1, get_chunk_file($chunk1)) or die;
    	        merge_copy_block($fh1, $fh2, $table);
		        close($fh1);
			} else {
                dp("output copy",{chunk2 => $chunk2, table => $table});
	            output_copy_block($fh2, $table);
			}
        } else {
            dp("output", {chunk2 => $chunk2, table => $chunk2->{table}});
            output_normal_block($fh2);
        }

        close($fh2);
    }
}

sub merge_copy_block {
    my ($fh1, $fh2, $table) = @_;
    my @lines1 = <$fh1>;
    my @lines2 = <$fh2>;

    my $tschema = $schema->{$table};
    my @merged_lines = @{merge_block($tschema, \@lines1, \@lines2)};
    my @sorted_merged_lines = @{sort_block($tschema, \@merged_lines)};

    print for @sorted_merged_lines;
}

sub output_copy_block {
	my ($fh2, $table) = @_;
    my @lines2 = <$fh2>;

    my $tschema = $schema->{$table};

    my @sorted_lines = @{sort_block($tschema, \@lines2)};

    print for @sorted_lines;
}

sub output_normal_block {
    my ($fh) = @_;
    print while (<$fh>);
}

sub merge_block {
    my ($tschema, $lines1, $lines2) = @_;

    # Identify primary key columns
    my $pkey_cols = $tschema->{pkey};
    die "No primary key defined for table" . $tschema->{table} unless $pkey_cols;

    # Identify timestamp columns
    my $cols = $tschema->{cols};
    my @timestamp_cols = grep { $TIMESTAMP_COL_TYPES->{$cols->{$_}->{col_type}} } keys %$cols;

    # Create a mapping of column names to indices
    my $i = 0;
    my $index = { map { ($_ => $i++) } @{$tschema->{copy_cols}} };

    # Debugging: Show identified primary key and timestamp columns
    dp("Identified primary key and timestamp columns", {
        pkey_cols => $pkey_cols,
        timestamp_cols => \@timestamp_cols,
        index => $index,
    });

    # Track all primary keys present in dump2
    my %pkeys_in_dump2;

    # Create a hash map for lines from dump1 using primary keys
    my %line_map;
    foreach my $line (@$lines1) {
        chomp($line);
        my @fields = split(/\t/, $line);

        # Generate a primary key-based key
        my $pkey = join('|', map { $fields[$index->{$_}] } @$pkey_cols);

        # Store the line in the hash map
        $line_map{$pkey} = { line => \@fields, source => 1 };
    }

    # Process lines from dump2 and compare with dump1
    foreach my $line (@$lines2) {
        chomp($line);
        my @fields = split(/\t/, $line);

        # Generate a primary key-based key
        my $pkey = join('|', map { $fields[$index->{$_}] } @$pkey_cols);

        # Mark this primary key as present in dump2
        $pkeys_in_dump2{$pkey} = 1;

        if (exists $line_map{$pkey}) {
            # Compare fields excluding timestamps
            my $existing_fields = $line_map{$pkey}->{line};
            my $differ_only_in_timestamps = 1;

            for my $col (@{$tschema->{copy_cols}}) {
                next if grep { $_ eq $col } @timestamp_cols; # Skip timestamp columns

                if ($fields[$index->{$col}] ne $existing_fields->[$index->{$col}]) {
                    # Fields differ in non-timestamp column
                    $differ_only_in_timestamps = 0;
                    last;
                }
            }

            if ($differ_only_in_timestamps) {
                # Prefer line from dump1 (do nothing)
                next;
            } else {
                # Replace line from dump1 with line from dump2
                $line_map{$pkey} = { line => \@fields, source => 2 };
            }
        } else {
            # Add new line from dump2
            $line_map{$pkey} = { line => \@fields, source => 2 };
        }
    }

    # Remove lines from dump1 that are no longer in dump2
    foreach my $pkey (keys %line_map) {
        unless (exists $pkeys_in_dump2{$pkey}) {
            delete $line_map{$pkey};
        }
    }

    return [ map { join("\t", @{$_->{line}}) . "\n" } values %line_map ];
}

sub sort_block {
    my ($tschema, $lines) = @_;

    my $key = $tschema->{pkey} || ($tschema->{uniqs} && $tschema->{uniqs}->[0]) || [];
    my $copy_cols = $tschema->{copy_cols};
    my $cols = $tschema->{cols};

    my $i = 0;
    my $index = { map { ($_ => $i++) } @$copy_cols };

    my $sort = sub {
        my ($a, $b) = @_;
        my ($as, $bs) = ([split(/\t/, $a)], [split(/\t/, $b)]);
        for my $col (@$key) {
            my $i = $index->{$col};
            my $col_type = $cols->{$col}->{col_type};
            my $is_numeric = $NUMERIC_SORT_COL_TYPES->{$col_type};
            my $ret = $is_numeric ? $as->[$i] <=> $bs->[$i] : $as->[$i] cmp $bs->[$i];
            return $ret if $ret != 0;
        }
        return $a cmp $b;
    };

    return [sort { $sort->($a, $b) } @$lines];
}

# debug print
sub dp {
    my ($msg, $args) = @_;
    return unless $opts->{debug};
    print STDERR "DEBUG: $msg\n" . Dumper($args);
}

