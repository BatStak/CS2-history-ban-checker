const app = document.createElement("cs2-history-app-root");
const profile = document.querySelector(".profile_header_bg");
const gcpd = document.querySelector("#subtabs");
if (profile) {
    profile.append(app);
} else if (gcpd) {
    gcpd.after(app);
}
