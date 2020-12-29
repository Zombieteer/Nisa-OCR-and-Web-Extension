let inboxSdkId = "sdk_NesaDocLock_70621e1bb4";
let mailClientSecureToken = "ce8a1081-19cd-4ab5-bc49-8b0f9b893d64";

InboxSDK.load(2, inboxSdkId).then(function (sdk) {
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
  if (event.position === "THREAD") {
    // get attachments
    await getAttachments(sdk);
  }
};

const getAttachments = async (sdk) => {
  let filesToEncypt = [];
  let sender;

  let unRegister = await sdk.Conversations.registerMessageViewHandler(
    async (messageView) => {
      sender = messageView.getSender();
      let items = messageView.getFileAttachmentCardViews();

      //retrieve attachments to encrypt
      if (messageView.getViewState() === "EXPANDED") {
        if (messageView.isLoaded() && items.length) {
          // open getting attachment modal
          let attachment_read_modal = sdk.Widgets.showModalView({
            title: "Please Wait...",
            el: "<div>Attachments are being read</div>",
          });
          document.querySelector(
            ".inboxsdk__modal_content"
          ).style.marginTop = 0;

          for (let item of items) {
            try {
              let attachment = item._attachmentCardImplementation._element;
              let download_url = attachment.attributes.getNamedItem(
                "download_url"
              ).textContent;
              let re = /([^:]+):([^:]+):(.+)/;
              let match = re.exec(download_url);

              const contentType = match[1];
              const name = decodeURI(match[2]);
              const contentLink = match[3];

              let response = await fetch(contentLink);
              let blob = await response.blob();
              let file = new File([blob], name, { type: contentType });

              // const url = URL.createObjectURL(file);
              // let link = document.createElement("a");
              // link.href = url;
              // link.setAttribute("download", "file.pdf");
              // link.click();

              filesToEncypt.push({
                name: name,
                file,
              });
              console.log(filesToEncypt);

              console.log(match);
            } catch (error) {
              console.log(error);
            }
          }

          console.log("attachment retrieved", filesToEncypt);

          // close getting attachment modal
          attachment_read_modal.close();

          // encrypt file

          // send mail
          let attachments = [];
          sendMail(sdk, attachments);
        } else {
          // open no attachment found modal
          let no_attachment_found = sdk.Widgets.showModalView({
            title: "Recheck the message file",
            el: "<div>No Attachments were found within opened message</div>",
            buttons: [
              {
                text: "Ok",
                type: "PRIMARY_ACTION",
                showCloseButton: true,
                onClick: () => no_attachment_found.close(),
              },
            ],
          });
          document.querySelector(
            ".inboxsdk__modal_content"
          ).style.marginTop = 0;
          document.querySelector(
            ".inboxsdk__modal_buttons"
          ).style.paddingTop = 0;
        }
      }
    }
  );

  unRegister();
};

const sendMail = async (sdk, attachments) => {
  // open sending mail modal
  let sending_mail_modal = sdk.Widgets.showModalView({
    title: "Please Wait...",
    el: "<div>Mail is being reverter with protected attachments</div>",
  });
  document.querySelector(".inboxsdk__modal_content").style.marginTop = 0;

  const showResponseModal = (title, message) => {
    let mail_sent_modal = sdk.Widgets.showModalView({
      title,
      el: `<div>${message}</div>`,
      buttons: [
        {
          text: "Ok",
          type: "PRIMARY_ACTION",
          showCloseButton: true,
          onClick: () => mail_sent_modal.close(),
        },
      ],
    });
    document.querySelector(".inboxsdk__modal_content").style.margin = 0;
  };

  let loggedInUser = await sdk.User.getEmailAddress();

  Email.send({
    SecureToken: mailClientSecureToken,
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
      sending_mail_modal.close();
      showResponseModal(
        "Success",
        "Mail has been reverted, please check inbox"
      );
    } else {
      sending_mail_modal.close();
      showResponseModal(
        "Failed / Error",
        "Mail sending failed, please try again or contact support@nisafinance.com"
      );
    }
  });
};
