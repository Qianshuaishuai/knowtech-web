import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from '../service/message.service';

@Component({
  selector: 'app-prompt-message',
  templateUrl: './prompt-message.component.html',
  styleUrls: ['./prompt-message.component.scss']
})
export class PromptMessageComponent implements OnInit, OnDestroy {

  promptMessageSubscription: Subscription;

  message = '';

  constructor(
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.promptMessage();
  }

  promptMessage() {
    this.promptMessageSubscription = this.messageService.getPromptMessage().subscribe(message => {
      const element = document.getElementById('prompt');

      this.message = message;
      element.style.display = 'block';

      document.getElementById('prompt').addEventListener('animationend', function() {
        element.style.display = 'none';
      });

      document.querySelector('.prompt').className = 'prompt';
      window.requestAnimationFrame(function(time) {
        window.requestAnimationFrame(function(frame) {
          document.querySelector('.prompt').className = 'prompt animation';
        });
      });
    }, error => console.log('Prompt message: ' + error));
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.

    if (this.promptMessageSubscription !== undefined) {
      this.promptMessageSubscription.unsubscribe();
    }
  }
}
