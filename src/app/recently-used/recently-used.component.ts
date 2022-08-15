import { Component, OnInit } from '@angular/core';
import {SharedStateService} from "../shared-state.service";
import {CustomImageStoreService} from "../custom-image-store.service";
import {DrawStyle} from "../drawlayer/draw-style";

@Component({
  selector: 'app-recently-used',
  templateUrl: './recently-used.component.html',
  styleUrls: ['./recently-used.component.css']
})
export class RecentlyUsedComponent implements OnInit {

  public tools: Array<any> = [];

  constructor(private sharedState: SharedStateService) {}

  ngOnInit(): void {
    this.sharedState.recentlyUsedTools.subscribe(_tools => {
      console.log(_tools);
      this.tools = _tools;
    });
  }

  getImageUrl(file: string) {
    if (file) {
      const customImageDataUrl = CustomImageStoreService.getImageDataUrl(file);
      if (customImageDataUrl) {
        return customImageDataUrl;
      }
      return DrawStyle.getImageUrl(file);
    }
    return null;
  }

  setSign(sign: any) {
    this.sharedState.selectSign(sign);
  }
}
