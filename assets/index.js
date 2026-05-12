const app = document.createElement("cs2-history-app-root");
const profile = document.querySelector(".profile_page .profile_content .profile_leftcol");
const gcpd = document.querySelector("#subtabs");
if (profile) {
    setTimeout(() => profile.prepend(app), 500);
} else if (gcpd) {
    gcpd.after(app);
}
