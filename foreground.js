// setting css class for element in page
// document.querySelector("#hplogo").classList.add("spinspinspin");

// how will backend and frontend will talk
const first = document.createElement("button");
first.innerText = "set data";
first.id = "first";

const second = document.createElement("button");
second.innerText = "shoutout to backend";
second.id = "second";

document.querySelector("body").appendChild(first);
document.querySelector("body").appendChild(second);

first.addEventListener("click", () => {
  // chrome.storage.sync
  chrome.storage.local.set({ password: "123" });
  console.log("i set data");
});

second.addEventListener("click", () => {
  chrome.runtime.sendMessage(
    {
      message: "yo chekc the storage",
    },
    // (res) => console.log(res)
  );
  console.log("i sent the message");
});
