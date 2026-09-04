import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I18NService } from '../../state/i18n.service';
import { trpc } from '../../api/trpc.client';
import { trpcRequest } from '../../api/trpc.error';

type MapLayerGenerationConfig = Awaited<ReturnType<typeof trpc.admin.mapLayerGeneration.config.query>>;

@Component({
  selector: 'app-admin-map-layer-generation',
  templateUrl: './admin-map-layer-generation.component.html',
  styleUrls: ['./admin-map-layer-generation.component.scss'],
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
})
export class AdminMapLayerGenerationComponent implements OnInit {
  public i18n = inject(I18NService);
  public config = signal<MapLayerGenerationConfig | null>(null);
  public isLoading = signal(false);
  public isTriggering = signal(false);
  public isSaving = signal(false);
  private snackBar = inject(MatSnackBar);
  private formBuilder = inject(FormBuilder);
  public form = this.formBuilder.nonNullable.group({
    enabled: false,
    allwaysCreateDistrict: false,
    cantons: ['', Validators.required],
    urlMadd: ['', Validators.required],
    urlSwissBoundaries3d: ['', Validators.required],
    urlSwissNames3d: ['', Validators.required],
    fieldsSwissNames3d: ['', Validators.required],
    fileSwissNames3d: ['', Validators.required],
  });

  public ngOnInit(): void {
    void this.loadConfig();
  }

  public async loadConfig(): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await trpcRequest(trpc.admin.mapLayerGeneration.config.query());
      if (response.result) {
        this.config.set(response.result);
        this.form.reset({
          enabled: response.result.enabled,
          allwaysCreateDistrict: response.result.allwaysCreateDistrict,
          cantons: response.result.cantons,
          urlMadd: response.result.urlMadd,
          urlSwissBoundaries3d: response.result.urlSwissBoundaries3d,
          urlSwissNames3d: response.result.urlSwissNames3d,
          fieldsSwissNames3d: response.result.fieldsSwissNames3d,
          fileSwissNames3d: response.result.fileSwissNames3d,
        });
      } else {
        this.snackBar.open(this.i18n.get('error'), 'OK', { duration: 3000 });
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  public async saveConfig(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const value = this.form.getRawValue();
    const response = await trpcRequest(trpc.admin.mapLayerGeneration.update.mutate(value));
    if (response.result) {
      this.config.set(response.result);
      this.form.markAsPristine();
      this.snackBar.open(this.i18n.get('mapLayerGenerationSaved'), 'OK', { duration: 3000 });
    } else {
      this.snackBar.open(response.error?.message ?? this.i18n.get('error'), 'OK', { duration: 4000 });
    }
    this.isSaving.set(false);
  }

  public async triggerGeneration(): Promise<void> {
    this.isTriggering.set(true);
    const response = await trpcRequest(trpc.admin.mapLayerGeneration.trigger.mutate());
    if (response.error) {
      this.snackBar.open(response.error.message, 'OK', { duration: 4000 });
    } else {
      this.snackBar.open(this.i18n.get('mapLayerGenerationTriggered'), 'OK', { duration: 3000 });
    }
    this.isTriggering.set(false);
  }
}
