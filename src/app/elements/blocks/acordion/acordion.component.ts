import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-acordion',
  templateUrl: './acordion.component.html',
  styleUrls: ['./acordion.component.scss']
})
export class AcordionComponent implements OnInit {

  @Input('title') title: string;
  @Input('className') className: string;

  private isOpen: boolean;

  constructor() {
    this.isOpen = false;
  }

  ngOnInit() {
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
