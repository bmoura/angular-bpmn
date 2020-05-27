import {
  AfterContentInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
  SimpleChanges
} from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

/**
 * You may include a different variant of BpmnJS:
 *
 * bpmn-viewer  - displays BPMN diagrams without the ability
 *                to navigate them
 * bpmn-modeler - bootstraps a full-fledged BPMN editor
 */
import * as BpmnJS from 'bpmn-js/dist/bpmn-modeler.development';

import { importDiagram } from './rx';

import { throwError } from 'rxjs';

@Component({
  selector: 'app-diagram',
  template: `
    <div #ref class="diagram-container"></div>
  `,
  styles: [
    `
      .diagram-container {
        height: 100%;
        width: 100%;
      }
    `
  ]
})
export class DiagramComponent implements AfterContentInit, OnChanges, OnDestroy {

  private bpmnJS: BpmnJS;

  private InteractionLogger: Function;


  @ViewChild('ref') private el: ElementRef;

  @Input() private url: string;

  constructor(private http: HttpClient) {

    this.InteractionLogger = (eventBus: BpmnJS.EventBus) => {

      eventBus.on('element.click', function (event: BpmnJS.InternalEvent, bar) {
        console.log(bar)
      });

      eventBus.on('shape.move.end', function (event, bar) {
        console.log(event, bar)
      });

      eventBus.on('import.parse.complete', function (event, bar) {
        console.log(event, bar)
      });

    }

    this.bpmnJS = new BpmnJS({
      additionalModules: [{
        __init__: ['interactionLogger'],
        interactionLogger: ['type', this.InteractionLogger]
      }]
    });

  }

  ngAfterContentInit(): void {
    console.log(this.bpmnJS)
    this.bpmnJS.attachTo(this.el.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges) {
    // re-import whenever the url changes
    if (changes.url) {
      this.loadUrl(changes.url.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.bpmnJS.destroy();
  }

  /**
   * Load diagram from URL and emit completion event
   */
  loadUrl(url: string){

    importDiagram(this.bpmnJS)

  }

}
