/**
 * The Wandering Lens — Virtual Wild Safari
 * Copyright (c) 2026 Devakumar M
 * Story, characters and narrative: All Rights Reserved
 * Code: CC BY-NC-ND 4.0
 * https://github.com/ddeva6/wandering-lens
 */

import { eventBus } from '../utils/eventBus.js';
import { save } from '../utils/localStorage.js';

function createIcon(svgPath) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', svgPath);
  svg.appendChild(path);
  return svg;
}

function showOverlay() {
  eventBus.emit('controls:freeze');

  const canvas = document.getElementById('game-canvas');
  if (canvas) {
    canvas.style.transition = 'filter 3s';
    canvas.style.filter = 'brightness(0.4)';
  }

  setTimeout(() => {
    const overlay = document.createElement('div');
    overlay.className = 'ending-overlay';

    const quote = document.createElement('div');
    quote.className = 'ending-quote';
    quote.innerHTML = `
      <p>"Whatever you found here — the decision is yours. Not mine. It was always yours."</p>
      <p class="ending-quote-author">— Victor Osei Mensah, Field Journal, 1993</p>
    `;
    overlay.appendChild(quote);
    document.body.appendChild(overlay);

    setTimeout(() => {
      quote.style.opacity = '1';
    }, 100);

    setTimeout(() => {
      const cardsContainer = document.createElement('div');
      cardsContainer.className = 'ending-cards-container';

      const cardsData = [
        {
          id: 'publish',
          iconPath: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
          title: 'PUBLISH',
          subtitle: "Send Victor's evidence to his editor at National Geographic.",
          consequence: "His name is cleared. The operation is exposed. The world knows what happened here.",
          buttonText: "Send the photographs"
        },
        {
          id: 'bury',
          iconPath: 'M2 12h20 M12 2v20 M12 12a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M4.93 4.93l14.14 14.14 M4.93 19.07L19.07 4.93', // Simple abstract earth
          title: 'BURY IT',
          subtitle: "Return the evidence to the ground where Victor hid it.",
          consequence: "The land stays hidden. The animals stay undisturbed. Some truths belong to the earth.",
          buttonText: "Leave it where it rests"
        },
        {
          id: 'return',
          iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', // Simple abstract shield/hands
          title: 'RETURN THE LAND',
          subtitle: "Give Victor's coordinates and evidence to Amara's community.",
          consequence: "The Maasai file for stewardship. The land returns to those who have always known it.",
          buttonText: "Give it to Amara"
        }
      ];

      const cards = cardsData.map(data => {
        const card = document.createElement('div');
        card.className = 'ending-card';

        const iconDiv = document.createElement('div');
        iconDiv.className = 'ending-card-icon';
        iconDiv.appendChild(createIcon(data.iconPath));

        const title = document.createElement('h3');
        title.className = 'ending-card-title';
        title.textContent = data.title;

        const subtitle = document.createElement('p');
        subtitle.className = 'ending-card-subtitle';
        subtitle.textContent = data.subtitle;

        const consequence = document.createElement('p');
        consequence.className = 'ending-card-consequence';
        consequence.textContent = data.consequence;

        const button = document.createElement('button');
        button.className = 'ending-card-button';
        button.textContent = data.buttonText;

        card.appendChild(iconDiv);
        card.appendChild(title);
        card.appendChild(subtitle);
        card.appendChild(consequence);
        card.appendChild(button);

        card.addEventListener('click', () => {
          cards.forEach(c => {
            if (c !== card) {
              c.classList.add('ending-card--faded');
            }
          });
          card.classList.add('ending-card--selected');

          setTimeout(() => {
            save('ending_chosen', data.id);
            overlay.remove();
            if (canvas) {
              canvas.style.transition = '';
              canvas.style.filter = '';
            }
            eventBus.emit('story:endingChosen', { ending: data.id });
            eventBus.emit('controls:unfreeze');
          }, 2000);
        });

        return card;
      });

      cards.forEach(card => cardsContainer.appendChild(card));
      overlay.appendChild(cardsContainer);

      const smallText = document.createElement('p');
      smallText.className = 'ending-small-text';
      smallText.textContent = "There is no wrong answer.";
      overlay.appendChild(smallText);

      setTimeout(() => {
        cardsContainer.classList.add('ending-cards-container--visible');
      }, 100);

      setTimeout(() => {
        smallText.classList.add('ending-small-text--visible');
      }, 10000);

    }, 4000);

  }, 3000);
}

export function init() {
  eventBus.on('story:endingUnlocked', showOverlay);
}
