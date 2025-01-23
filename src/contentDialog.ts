export var dialog: string = `
  <style>
    /* Style the dialog element */
    dialog {
      border: none;
      text-wrap: wrap;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      width: 600px;
      background: #fff;
      animation: fadeIn 0.3s ease-in-out;
    }

    /* Add a fade-in animation */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Overlay style */
    dialog::backdrop {
      background: rgba(0, 0, 0, 0.5);
    }

    /* Button styles */
    button {
      width: 101px;
      height: 32px;
      background: rgb(221,60,76);
      color: rgb(245,245,245);
      font-size: 16px;
      padding: 8px 8px;
      margin: 8px;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
      border-color: rgb(221,60,76);
      overflow: hidden;
    }

    button:hover {
      opacity: 10;
    }

    .open-btn {
      float : right;
    }

    .close-btn {
      background-color: #ff5c5c;
    }

    .close-btn:hover {
      background-color: #cc4949;
    }

    .copy-btn {
      background-color: #007bff;
    }

    .copy-btn:hover {
      background-color: #0056b3;
    }
  </style>

  <button id="open-dialog" class="open-btn">warning</button>

  <!-- Dialog Element -->
  <dialog id="popup-dialog">
    <h1>Insecure code Information</h1>
    <div id="dialogContent">
      <div id="contentExplanation"></div>
      <div id="contentVul"></div>
      <div id="contentImprove"></div>
      <h3>More secure version:</h3>
      <div id="contentCode"></div>
    </div>
    <div style="display: flex; justify-content: flex-end;">
      <button class="copy-btn" id="copy-dialog">Copy</button>
      <button class="close-btn" id="close-dialog">Close</button>
    </div>
  </dialog>
`;	