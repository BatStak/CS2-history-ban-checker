const app = document.createElement("cs2-history-app-root");
const profile = document.querySelector(".profile_page .profile_content .profile_leftcol");
const gcpd = document.querySelector("#subtabs");
if (profile) {
    profile.prepend(app);
} else if (gcpd) {
    gcpd.after(app);
}
