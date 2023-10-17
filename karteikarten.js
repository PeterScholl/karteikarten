      
    // Key-Listener einbauen
    document.addEventListener('keydown', function(event) {
      if (event.ctrlKey && event.key === '+') {
        // Hier deinen Code zum Vergrößern der Schriftgröße einfügen
        event.preventDefault(); // Verhindert, dass der Browser die Standardaktion ausführt
        increaseFontSizeButton.click();
      } else if (event.ctrlKey && event.key === '-') {
        // Reagiere auf Strg-Minus (-)
        event.preventDefault();
        decreaseFontSizeButton.click();
      } else if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        if (answerElement.style.display === 'none') {
          //Antwort ist noch nicht angezeigt
          showAnswerButton.click();
        } else { //Antwort wird angezeigt
          nextCardButton.click();
        }
      } else if (event.ctrlKey && event.key === 't') {
        //event.preventDefault();
        increaseMathJaxFontSize(4);
      }
    });
    
    //Test-Funktion zur Anpassung der Math-Jax-Elemente
    function increaseMathJaxFontSize(increaseBy) {
      // Finde alle Elemente mit der Klasse .MathJax
      const mathJaxElements = document.querySelectorAll('.mjx-chtml');
      console.log('t gedrückt :-)');

      // Iteriere über alle MathJax-Elemente
      mathJaxElements.forEach(function(element) {
        console.log('Math-Jax Element gefunden');
        // Lese die aktuelle Schriftgröße als Zeichenkette (z.B., "16px")
        const currentFontSizeString = window.getComputedStyle(element, null).getPropertyValue('font-size');
        console.log('mit Fontsize'+currentFontSizeString);
        // Extrahiere den numerischen Wert der aktuellen Schriftgröße
        const currentFontSize = parseFloat(currentFontSizeString);

        // Überprüfe, ob die aktuelle Schriftgröße gültig ist und erhöhe sie um den angegebenen Wert
        if (!isNaN(currentFontSize)) {
          const newFontSize = currentFontSize + increaseBy;
          console.log('neue Fontsize'+newFontSize);
          element.style.fontSize = newFontSize + 'px';
        }
      });
    }
    
    // Lies den Query-Parameter 'file' aus der URL oder verwende einen Standardwert
    const urlParams = new URLSearchParams(window.location.search);
    const csvFile = urlParams.has('file') ? urlParams.get('file') : 'karteikarten.csv';

    // Funktion zum Lesen von CSV in ein Array
    function parseCSV(csv) {
	    const result = [];

      const lines = csv.split('\n');
      //const headers = lines[0].split(',');
      for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i].split(',');
        if (currentLine.length >= 2) {
          const questiontext = currentLine[0] ? currentLine[0].trim() : '';
          const answertext = currentLine[1] ? currentLine[1].trim() : '';
          if (questiontext !== '' || answertext !== '') {
            const card = { question: questiontext, answer: answertext };
            result.push(card);
          }
        }
      }

      return result;
    }
    
    // Parsen der CSV-Datei mit PapaParse
    function parseCSVWithoutHeader(csvString) {
        return new Promise((resolve, reject) => {
            Papa.parse(csvString, {
                header: false, // Keine Header-Zeile
                delimiter: ',',
                quoteChar: '"',
                dynamicTyping: true,
                complete: function(results) {
                    if (results.errors.length > 0) {
                        reject(results.errors);
                    } else {
                        const data = results.data.map(item => {
                            return {
                                question: item[0], // Erste Spalte
                                answer: item[1],   // Zweite Spalte
                                // Weitere Felder hier, falls vorhanden
                            };
                        });
                        resolve(data);
                    }
                }
            });
        });
    }




    const questionElement = document.getElementById('question');
    const answerElement = document.getElementById('answer');
    const showAnswerButton = document.getElementById('showAnswer');
    const nextCardButton = document.getElementById('nextCard');
    const previousCardButton = document.getElementById('previousCard');
    const dataCountElement = document.getElementById('dataCount');

    showAnswerButton.addEventListener('click', () => {
      answerElement.style.display = 'block';
    });

    nextCardButton.addEventListener('click', () => {
      currentCard = (currentCard + 1) % flashcards.length;
      showFlashcard();
    });

    previousCardButton.addEventListener('click', () => {
      currentCard = (flashcards.length+currentCard - 1) % flashcards.length;
      showFlashcard();
    });

    let currentCard = 0;
    let flashcards = [];

    // Funktion zum Laden der CSV-Datei
    function loadCSVFile(url) {
        fetch(url)
          .then(response => {
            if (!response.ok) {
           		throw new Error('Fehler beim Laden der Datei: ' + response.status);
       	    }
            return response.text();
          })
          .then(data => {
            /* //alte Version
            flashcards = parseCSV(data);
            // Update Counter und currentCard
            showFlashcard();
            updateDataCount(flashcards.length);
            renderAllFlashcards();
            */
            //neue Version mit PapaParse
            parseCSVWithoutHeader(data)
              .then(data => {
                  console.log(data);
                  // Hier kannst du die Daten verwenden, die im gewünschten Format vorliegen
                  flashcards = data;
                  showFlashcard();
                  updateDataCount(flashcards.length);
                  renderAllFlashcards();
              })
              .catch(errors => {
                  console.error('Fehler beim Parsen der CSV-Datei:', errors);
                  // Hier kannst du Fehlerbehandlung durchführen
              });
          })
          .catch(error => {
            // Hier wird der Fehler behandelt und dem Benutzer eine Fehlermeldung angezeigt
            console.error('Fehler beim Laden der CSV-Datei: ' + error);
            alert('Die Datei konnte nicht gefunden oder geladen werden. Bitte überprüfen Sie die URL.');
          });
    }
    
    //Funktion zum laden einer lokalen Datei
    const fileInput = document.getElementById('fileInput');
        
    fileInput.addEventListener('change', function() {
      const selectedFile = fileInput.files[0];
      if (selectedFile) {
        console.log('Ausgewählte Datei:', selectedFile);
        // Hier kannst du den ausgewählten Dateiinhalt verarbeiten
        const reader = new FileReader();

        reader.onload = function(event) {
          const fileContent = event.target.result;
          // Hier hast du den Inhalt der CSV-Datei in der Variablen 'fileContent'
          /* alte Version
          flashcards = parseCSV(fileContent);
          showFlashcard();
          updateDataCount(flashcards.length);
          renderAllFlashcards();
          */
          //neue Version mit PapaParse
          parseCSVWithoutHeader(fileContent)
            .then(data => {
                console.log(data);
                // Hier kannst du die Daten verwenden, die im gewünschten Format vorliegen
                flashcards = data;
                showFlashcard();
                updateDataCount(flashcards.length);
                renderAllFlashcards();
            })
            .catch(errors => {
                console.error('Fehler beim Parsen der CSV-Datei:', errors);
                // Hier kannst du Fehlerbehandlung durchführen
            });
        };

        reader.readAsText(selectedFile);
      }
    });

    // Funktionalität zum herunterladen der Karten als csv-Datei
    const downloadButton = document.getElementById('downloadButton');
    const downloadLink = document.getElementById('downloadLink');

    downloadButton.addEventListener('click', function() {
      //const csvContent = flashcards.map(card => `${card.question},${card.answer}`).join('\n');
      //CSV-content wird jetzt mit " gespeichert für die Nutzung von Kommata
      /* // Filtere Karteikarten, bei denen weder question noch answer eine Zeichenkette sind
      const validFlashcards = flashcards.filter(card => {
        return typeof card.question === 'string' && typeof card.answer === 'string';
      }); */

      // Filtere Karteikarten und konvertiere alles in Zeichenketten
      const validFlashcards = flashcards.filter(card => {
        const question = typeof card.question === 'string' ? card.question : card.question.toString();
        const answer = typeof card.answer === 'string' ? card.answer : card.answer.toString();
        card.question = question;
        card.answer = answer;
        return typeof card.question === 'string' && typeof card.answer === 'string';
      });

      // Konvertiere die validen Karteikarten in CSV mit doppelten Anführungszeichen wenn vorhanden
      const csvContent = validFlashcards
        .map(card => `"${card.question.replace(/"/g, '""')}","${card.answer.replace(/"/g, '""')}"`)
        .join('\n');
      downloadLink.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      downloadLink.style.display = 'block';
      downloadLink.click();
    });

    // Funktion zum Anzeigen der aktuellen Karte
    function showFlashcard() {
      if (currentCard > flashcards.length-1) {
        currentCard = 0;
      }
      if (flashcards[currentCard]) {
        questionElement.innerHTML = flashcards[currentCard].question;
        answerElement.innerHTML = "<hr>"+flashcards[currentCard].answer;
        answerElement.style.display = 'none';
        // Nachdem die neue Karteikarte geladen wurde, rufe MathJax auf, um die LaTeX-Syntax in dieser Karteikarte zu übersetzen.
        // Hier wird "questionElement" verwendet, um die LaTeX-Syntax in der Frage der Karteikarte zu übersetzen
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, questionElement]); 
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, answerElement]); 
      }
    }

    // Funktionen zur Veränderung der Karten-Schriftgröße
    const increaseFontSizeButton = document.getElementById('increaseFontSize');
    const decreaseFontSizeButton = document.getElementById('decreaseFontSize');

    const cardTextElements = document.querySelectorAll('.card-text'); // Annahme: Diese Klasse wird für die Frage und Antwort verwendet

    let currentFontSize = 40; // Standard-Schriftgröße (in Pixel)

    increaseFontSizeButton.addEventListener('click', function() {
        currentFontSize += 2; // Erhöhe die Schriftgröße um 2 Pixel
        updateCardTextSize();
    });

    decreaseFontSizeButton.addEventListener('click', function() {
        currentFontSize -= 2; // Verringere die Schriftgröße um 2 Pixel
        updateCardTextSize();
    });

    function updateCardTextSize() {
        for (const element of cardTextElements) {
            element.style.fontSize = currentFontSize + 'px';
        }
    }
    updateCardTextSize(); //Einmal auf den eingestellten Wert setzen


    // Zufällige Reihenfolge der Karten
    function shuffleCards() {
      for (let i = flashcards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flashcards[i], flashcards[j]] = [flashcards[j], flashcards[i]];
      }
    }

    // Funktion zum Aktualisieren der Datensatzanzahl
    function updateDataCount(count) {
      dataCountElement.innerText = `Anzahl der Datensätze: ${count}`;
    }

    // Lade die CSV-Datei (wird weiter oben definiert)
    loadCSVFile(csvFile);

    // Button für das Mischen
    const shuffleCardsButton = document.getElementById('shuffleCards');
    shuffleCardsButton.addEventListener('click', shuffleCards);

    // hier kommt der Bereich zum Anzeigen aller Karteikarten
    const showAllCardsButton = document.getElementById('showAllCards');
    const flashcardView = document.getElementById('flashcardView');
    const flashcardTableBody = document.getElementById('flashcardTableBody');
    
    showAllCardsButton.addEventListener('click', toggleAllCardsView);

    let isAllCardsViewVisible = false;

    function toggleAllCardsView() {
      isAllCardsViewVisible = !isAllCardsViewVisible;
      if (isAllCardsViewVisible) {
        showAllCardsButton.classList.add('active');
        flashcardView.style.display = 'block';
        renderAllFlashcards();
      } else {
        showAllCardsButton.classList.remove('active');
        flashcardView.style.display = 'none';
      }
    }

    // hier kommt der Bereich zum Anzeigen der Dateiaktionen
    const showFileOptionsButton = document.getElementById('showFileOptions');
    const fileHandling = document.getElementById('fileHandling');

    showFileOptionsButton.addEventListener('click', toggleFileHandlingView);

    let isFileHandlingVisible = false;

    function toggleFileHandlingView() {
      isFileHandlingVisible = !isFileHandlingVisible;
      if (isFileHandlingVisible) {
        showFileOptionsButton.classList.add('active');
        fileHandling.style.display = 'block';
      } else {
        showFileOptionsButton.classList.remove('active');
        fileHandling.style.display = 'none';
      }
    }

    function renderAllFlashcards() {
      if (isAllCardsViewVisible) {
        flashcardTableBody.innerHTML = ''; // Leert die Tabelle

        // Schleife durch alle Karteikarten und füge sie zur Tabelle hinzu
        for (let i = 0; i < flashcards.length; i++) {
          const card = flashcards[i];
          const row = document.createElement('tr');
          const questionCell = document.createElement('td');
          const answerCell = document.createElement('td');
          const actionsCell = document.createElement('td');
          
          questionCell.textContent = card.question;
          answerCell.textContent = card.answer;

          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Löschen';
          deleteButton.className = 'delete-card';
          deleteButton.setAttribute('data-card-id', i); // Eindeutige Kartenkennung
          deleteButton.style.marginRight = '10px'; // Beispiel: 10px Abstand zwischen den Buttons

          const editButton = document.createElement('button');
          editButton.textContent = 'Bearbeiten';
          editButton.className = 'edit-card';
          editButton.setAttribute('data-card-id', i); // Eindeutige Kartenkennung
    
          actionsCell.appendChild(deleteButton);
          actionsCell.appendChild(editButton);

          row.appendChild(questionCell);
          row.appendChild(answerCell);
          row.appendChild(actionsCell);

          flashcardTableBody.appendChild(row);
        }
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, flashcardTableBody]); // Hier MathJax über die Tabelle auslösen
      }
    }
    
    // Funktion zum Löschen einer Karte
    function deleteCard(cardId) {
        // Hier kannst du die Logik zum Löschen der Karte implementieren, z. B.:
        // cardData.splice(cardId, 1); // Entferne die Karte aus deinem Datenarray
        flashcards.splice(cardId,1);
        updateDataCount(flashcards.length);
        // Rufe die Funktion zum Aktualisieren der Tabelle auf
        renderAllFlashcards();
    }

    // Eventlistener für Löschen-Buttons
    document.querySelector('table').addEventListener('click', function (e) {
        if (e.target && e.target.matches('button.delete-card')) {
          const cardId = e.target.getAttribute('data-card-id');
          deleteCard(cardId);
        } else if (e.target && e.target.matches('button.edit-card')) {
          const cardId = e.target.getAttribute('data-card-id');
          modalCurrentCardIndex = cardId;
          modal.style.display = 'block';
          modalDisplayCurrentCard();
        }
    });
    
    // JavaScript-Code zum Öffnen und Schließen des Modals
    const openModalButton = document.getElementById('openModalButton');
    const modal = document.getElementById('modal');
    const closeModalButton = document.getElementById('closeModalButton');
    const editCardForm = document.getElementById('editCardForm');
    const questionInput = document.getElementById('modalQuestion');
    const answerInput = document.getElementById('modalAnswer');
    let modalCurrentCardIndex = 0; // Index der aktuellen Karteikarte

    openModalButton.addEventListener('click', function() {
      //Modal anzeigen
      modal.style.display = 'block';
      //Mit Karte füllen
      modalDisplayCurrentCard();
    });

    closeModalButton.addEventListener('click', function() {
      modal.style.display = 'none';
    });
    
    editCardForm.addEventListener('submit', function(event) {
      //Die Standard-Formularübermittlung wird verhindert
      event.preventDefault();
      // Hier kannst du die bearbeiteten Daten speichern oder verarbeiten
      const editedCard = {
          question: questionInput.value,
          answer: answerInput.value
      };
      if (modalCurrentCardIndex >= 0 && modalCurrentCardIndex < flashcards.length) {
        flashcards[modalCurrentCardIndex]=editedCard;
        renderAllFlashcards();
      } else {
        flashcards.push(editedCard);
        updateDataCount(flashcards.length);
        modalCurrentCardIndex = flashcards.length-1;
        renderAllFlashcards();
      }
      showSuccessMessage();
      console.log('Bearbeitete Karteikarte:', editedCard);
    });

    // Funktion, um die Erfolgsmeldung anzuzeigen
    function showSuccessMessage() {
        const successMessage = document.getElementById('modalSuccessMessage');
        successMessage.style.display = 'block';

        // Optional: Du kannst die Erfolgsmeldung nach ein paar Sekunden automatisch ausblenden
        setTimeout(function() {
            successMessage.style.display = 'none';
        }, 3000); // Beispiel: 3000 Millisekunden (3 Sekunden)
    }

    // Funktion zum Anzeigen der aktuellen Karteikarte
    function modalDisplayCurrentCard() {
      if (modalCurrentCardIndex >= 0 && modalCurrentCardIndex < flashcards.length) {
        const currentCard = flashcards[modalCurrentCardIndex];
        questionInput.value = currentCard.question;
        answerInput.value = currentCard.answer;
      } else {
        questionInput.value = '';
        answerInput.value = '';
      }
    }
    
    
    // Eventlistener für den "Vorherige Karteikarte"-Button
    const modalPreviousCardButton = document.getElementById('modalPreviousCardButton');
    modalPreviousCardButton.addEventListener('click', function() {
      //Die Standard-Formularübermittlung wird verhindert
      event.preventDefault();
      if (modalCurrentCardIndex > 0) {
          modalCurrentCardIndex--;
          modalDisplayCurrentCard();
      } else {
        modalCurrentCardIndex = 0;
      }
    });

    // Eventlistener für den "Nächste Karteikarte"-Button
    const modalNextCardButton = document.getElementById('modalNextCardButton');
    modalNextCardButton.addEventListener('click', function() {
      //Die Standard-Formularübermittlung wird verhindert
      event.preventDefault();
      if (modalCurrentCardIndex < flashcards.length - 1) {
          modalCurrentCardIndex++;
          modalDisplayCurrentCard();
      }
    });

    // Eventlistener für den "Neue Karteikarte"-Button
    const modalNewCardButton = document.getElementById('modalNewCardButton');
    modalNewCardButton.addEventListener('click', function() {
      //Die Standard-Formularübermittlung wird verhindert
      event.preventDefault();
      modalCurrentCardIndex=-1;
      modalDisplayCurrentCard();
    });

    // Eventlistener für den "Duplizieren"-Button
    const modalDuplicateCardButton = document.getElementById('modalDuplicateCardButton');
    modalDuplicateCardButton.addEventListener('click', function() {
      //Die Standard-Formularübermittlung wird verhindert
      event.preventDefault();
      modalCurrentCardIndex=-1;
    });

    // Schließe das Modal, wenn der Benutzer außerhalb des Modals klickt
    window.addEventListener('click', function(event) {
      if (event.target == modal) {
          modal.style.display = 'none';
      }
    });
