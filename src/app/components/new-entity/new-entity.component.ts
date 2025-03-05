import { Component, OnInit } from '@angular/core';
import { InputComponent } from "@shared/ui/input/input.component";

@Component({
  selector: 'app-new-entity',
  templateUrl: './new-entity.component.html',
  styleUrls: ['./new-entity.component.scss'],
  imports: [InputComponent]
})
export class NewEntityComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
