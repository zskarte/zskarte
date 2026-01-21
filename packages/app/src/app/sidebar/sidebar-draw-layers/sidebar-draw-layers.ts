import { Component, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { ZsMapStateService } from '../../state/state.service';
import { MatRadioButton, MatRadioChange, MatRadioGroup } from '@angular/material/radio';
import { MatButton, MatIconButton } from '@angular/material/button';
import { I18NService } from '../../state/i18n.service';
import { MatDialog, MatDialogActions, MatDialogClose, MatDialogContent } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { form, FormField, required, validate } from '@angular/forms/signals';
import { combineLatest, lastValueFrom, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MatIcon } from '@angular/material/icon';
import { ZsMapBaseLayer } from '../../map-renderer/layers/base-layer';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-sidebar-draw-layers',
  imports: [
    MatRadioButton,
    MatRadioGroup,
    MatButton,
    MatDialogActions,
    MatDialogContent,
    ReactiveFormsModule,
    FormField,
    MatDialogClose,
    MatFormFieldModule,
    MatInputModule,
    MatIcon,
    MatIconButton,
  ],
  templateUrl: './sidebar-draw-layers.html',
  styleUrl: './sidebar-draw-layers.scss',
})
export class SidebarDrawLayers {
  private stateService = inject(ZsMapStateService);
  private dialog = inject(MatDialog);
  protected i18n = inject(I18NService);

  private dialogTemplate = viewChild.required<TemplateRef<any>>('dialog');

  protected activeLayer = toSignal(this.stateService.observeActiveLayer());
  protected layers = toSignal(
    this.stateService.observeLayers().pipe(switchMap((layer) => combineLatest(layer.map((l) => this.mapLayer(l))))),
  );

  private mapLayer(layer: ZsMapBaseLayer) {
    return combineLatest([layer.observeName(), layer.observeIsVisible()]).pipe(
      map(([name, isVisible]) => ({ id: layer.getId(), name, isVisible })),
    );
  }
  private layerNameModel = signal({
    name: '',
  });
  protected layerNameForm = form(this.layerNameModel, (schema) => {
    required(schema.name, { message: this.i18n.get('fieldRequired') });
    validate(schema.name, (ctx) => {
      const value = ctx.value();
      const nameExists = this.layers()?.find((layer) => layer.name === value);
      if (nameExists) {
        return [
          {
            kind: 'duplicate',
            message: this.i18n.get('nameExists'),
          },
        ];
      }
      return null;
    });
  });

  protected addDrawLayer() {
    this.dialog
      .open(this.dialogTemplate(), { minWidth: '400px' })
      .afterClosed()
      .subscribe(() => {
        this.layerNameForm().reset({ name: '' });
      });
  }

  protected submit(e: SubmitEvent) {
    e.preventDefault();
    if (this.layerNameForm().invalid()) {
      return;
    }

    this.stateService.addDrawLayer(this.layerNameForm().value().name);
    this.dialog.closeAll();
  }

  protected activateLayer(e: MatRadioChange) {
    this.stateService.activateDrawLayer(e.value);
    this.stateService.toggleDrawLayerVisibility(e.value, true);
  }

  protected toggleLayerVisibility(id: string, visible: boolean) {
    this.stateService.toggleDrawLayerVisibility(id, visible);
  }

  protected async deleteLayer(id: string) {
    const confirmation = this.dialog.open(ConfirmationDialogComponent, {
      data: this.i18n.get('deleteLayerConfirm'),
    });

    const result = await lastValueFrom(confirmation.afterClosed());
    if (result) {
      this.stateService.removeDrawLayer(id);
    }
  }
}
