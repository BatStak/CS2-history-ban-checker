const app = document.createElement("app-root");
const gcpd = document.querySelector("#subtabs");
const friends = document.querySelector(".friends_container");
if (gcpd) {
  gcpd.after(app);
}
if (friends) {
  friends.before(app);
}
