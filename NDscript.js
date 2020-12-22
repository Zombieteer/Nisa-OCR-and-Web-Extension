InboxSDK.load(2, "sdk_NesaDocLock_70621e1bb4").then(function (sdk) {
  // the SDK has been loaded, now do something with it!
  sdk.Toolbars.registerThreadButton({
    title: "Encrypt File",
    iconUrl: chrome.runtime.getURL("logos/logo_128.png"),
    iconClass: "nisa-btn",
    positions: ["THREAD"],
    listSection: sdk.Toolbars.SectionNames.OTHER,
    onClick: (event) => btnClickHandler(event, sdk),
  });
});

const btnClickHandler = async (event, sdk) => {
  let sender, loggedInUser;
  let attachments = [];
  if (event.position === "THREAD") {
    loggedInUser = await sdk.User.getEmailAddress();

    await sdk.Conversations.registerMessageViewHandler(async (messageView) => {
      sender = messageView.getSender();

      messageView.getFileAttachmentCardViews().length &&
        messageView.getFileAttachmentCardViews().forEach((item) => {
          let attachment = item._attachmentCardImplementation._element;
          let download_url = attachment.attributes.getNamedItem("download_url")
            .textContent;
          let re = /([^:]+):([^:]+):(.+)/;
          let match = re.exec(download_url);

          let contentType = match[1];
          let name = decodeURI(match[2]);
          let contentLink = match[3];

          fetch(contentLink)
            .then((response) => {
              const reader = response.body.getReader();
              return new ReadableStream({
                start(controller) {
                  return pump();
                  function pump() {
                    return reader.read().then(({ done, value }) => {
                      if (done) {
                        controller.close();
                        return;
                      }
                      controller.enqueue(value);
                      return pump();
                    });
                  }
                },
              });
            })
            .then((stream) => new Response(stream))
            .then((response) => response.blob())
            .then((blob) => {
              let file = new File([blob], name, { type: contentType });
              // const url = URL.createObjectURL(file);
              
              // let link = document.createElement("a");
              // link.href = url;
              // link.setAttribute("download", "file.pdf");
              // link.click();
            })
            .catch((err) => console.error(err));

          attachments.push({
            name: `Nisa_Encrypted_${name}`,
            path: contentLink,
          });

          console.log(match);
        });
    });

    Email.send({
      SecureToken: "ce8a1081-19cd-4ab5-bc49-8b0f9b893d64",
      // Host: "smtp.gmail.com",
      // Username: "nisadoclock@gmail.com",
      // Password: "nisafinance",
      To: loggedInUser,
      From: "nisadoclock@gmail.com",
      Subject: "Protected file reverted by NisaDoclock",
      Body:
        "Download the attachment from this mail and upload it as your documents in NisaFinance",
      Attachments: attachments,
    }).then((message) => {
      if (message === "OK") {
        alert("Protected file has been reverted to your mail");
      } else {
        alert(
          "Mail sending failed, please try again or contact support@nisafinance.com"
        );
      }
    });
  }
};

// var el =
// '<div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"' +
// '<div class="modal-header">' +
// '<h3 id="myModalLabel">Attach Files</h3></div>' +
// '<div class="modal-body">' +
// '<form id="fileUploadForm" method="post" enctype="multipart/form-data">' +
// '<input type="file" name="FileAttachement[]" multiple="true" id="FileInput" class="form-control" value="FileInput" />' +
// "</form>" +
// '<input type="submit" class="fileAttachementSubmitButton">' +
// "</div></div>";

// sdk.Widgets.showModalView({
// el,
// });
