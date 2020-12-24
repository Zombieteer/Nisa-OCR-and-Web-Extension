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

const getAttachments = async (sdk) => {
  let filesToEncypt = [];
  let sender;

  await sdk.Conversations.registerMessageViewHandler(async (messageView) => {
    sender = messageView.getSender();
    let items = messageView.getFileAttachmentCardViews();

    if (messageView.isLoaded() && items.length) {
      for (let item of items) {
        try {
          let attachment = item._attachmentCardImplementation._element;
          let download_url = attachment.attributes.getNamedItem("download_url")
            .textContent;
          let re = /([^:]+):([^:]+):(.+)/;
          let match = re.exec(download_url);

          const contentType = match[1];
          const name = decodeURI(match[2]);
          const contentLink = match[3];

          let response = await fetch(contentLink);
          // let reader = response.body.getReader();
          // let stream = new ReadableStream({
          //   async start(controller) {
          //     return await pump();
          //     async function pump() {
          //       let { done, value } = await reader.read();
          //       if (done) {
          //         controller.close();
          //         return;
          //       }
          //       controller.enqueue(value);
          //       return await pump();
          //     }
          //   },
          // });
          // response = new Response(stream);
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
    }
  });

  return { filesToEncypt, sender };
};

const sendMail = (sdk, loggedInUser, attachments) => {
  const showModal = (title, message) => {
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
      showModal("Success", "Mail has been reverted, please check inbox");
    } else {
      showModal(
        "Failed / Error",
        "Mail sending failed, please try again or contact support@nisafinance.com"
      );
    }
  });
};

const btnClickHandler = async (event, sdk) => {
  let loggedInUser;
  if (event.position === "THREAD") {
    loggedInUser = await sdk.User.getEmailAddress();

    let attachment_read_modal = sdk.Widgets.showModalView({
      title: "Please Wait...",
      el: "<div>Attachments are being read</div>",
    });
    document.querySelector(".inboxsdk__modal_content").style.marginTop = 0;

    // get attachments
    let { filesToEncypt, sender } = await getAttachments(sdk);
    console.log(filesToEncypt, sender);

    attachment_read_modal.close();

    // encrypt file

    // send mail
    // if (attachments.length) sendMail(sdk, loggedInUser, attachments);
  }
};

// fetch(contentLink)
//   .then((response) => {
//     const reader = response.body.getReader();
//     return new ReadableStream({
//       start(controller) {
//         return pump();
//         function pump() {
//           return reader.read().then(({ done, value }) => {
//             if (done) {
//               controller.close();
//               return;
//             }
//             controller.enqueue(value);
//             return pump();
//           });
//         }
//       },
//     });
//   })
//   .then((stream) => new Response(stream))
//   .then((response) => response.blob())
//   .then((blob) => {
//     let file = new File([blob], name, { type: contentType });
//     filesToEncypt.push({
//       name: name,
//       file,
//     });
//     console.log(filesToEncypt);
//   })
//   .catch((err) => console.error(err));
