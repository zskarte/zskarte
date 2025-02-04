#!/usr/bin/env perl
# pg_dump_sort
#
# Copyright (c) 2021 htaketani <h.taketani@gmail.com>
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
my $PGTABLE = "$PGIDENT\.$PGIDENT";
my $PGCOL = $PGIDENT;

my $NUMERIC_SORT_COL_TYPES = { map { $_ => 1 } qw(smallint integer bigint decimal numeric real double) };

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

my $tmpdir = tempdir(CLEANUP => 1);
dp('make tmpdir', { tmpdir => $tmpdir });

my $chunks = [];
my $schema = {};
analyze();
dp('analyzed', { chunks => $chunks, schema => $schema });
recombine();

exit;

sub usage {
    print <<EOF;
Usage:
  pg_dump_sort [DUMP_FILE]
EOF
}

sub get_chunk_file {
    my ($chunk) = @_;
    return "$tmpdir/$chunk->{id}.$chunk->{type}";
}

# @return {hashRef} chunk data
#     id    : chunk id
#     fh    : chunk file handle
#     type  : chunk type ('normal' or 'copy')
#     table : table name (only in copy type)
sub new_chunk {
    my ($params) = @_;
    open(my $fh, '>', get_chunk_file($params)) or die;
    my $chunk = { %$params, fh => $fh };
    push @$chunks, $chunk;
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

sub analyze {
    my $chunk = new_chunk({ id => 0, type => 'normal' });

    while (my $buf = <>) {

        # multi line
        unless ($buf =~ /$LINE_SINGLE/o || $buf =~ /$LINE_SQL/o) {
            while (<>) {
                $buf .= $_;
                last if ($buf =~ /$LINE_SQL/o);
            }
        }

        my $res = analyze_buf($buf);
        write_chunk($chunk, $buf);

        if ($res->{is_copy}) {
            $chunk = switch_chunk($chunk, { type => 'copy', table => $res->{table} });

            # copy block
            while (<>) {
                if (/^\\\./) {
                    $chunk = switch_chunk($chunk, { type => 'normal' });
                    write_chunk($chunk, $_);
                    last;
                } else {
                    write_chunk($chunk, $_);
                }
            }
        }
    }

    close_chunk($chunk);
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

sub recombine {
    for my $chunk (@$chunks) {
        open(my $fh, get_chunk_file($chunk)) or die;
        if ($chunk->{type} eq 'copy') {
            output_copy_block($fh, $chunk->{table});
        } else {
            output_normal_block($fh);
        }
    }
}

sub output_copy_block {
    my ($fh, $table) = @_;
    my @lines = <$fh>;
    my $tschema = $schema->{$table};
    my $sorted = sort_block($tschema, \@lines);
    print for (@$sorted);
}

sub output_normal_block {
    my ($fh) = @_;
    print while (<$fh>);
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

