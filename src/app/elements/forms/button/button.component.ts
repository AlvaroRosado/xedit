import { isNil } from 'ramda';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {

    @Input() text: string;
    @Input() icon: string;
    @Input() click: Function;


    constructor() { }

    ngOnInit() {
    }

    onClick($evt: EventListener) {
        if (!isNil(this.click)) {
            this.click($evt);
        }
    }

}
