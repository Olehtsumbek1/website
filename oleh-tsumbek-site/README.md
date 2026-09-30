# olehtsumbek.com

Personal website of Oleh Tsumbek.
Plain static HTML, one stylesheet, one small script. No build step, no tracking, no animation.

## Files
- `index.html` home
- `mariupol-paper.html` Mariupol paper (What the Satellites Miss); PDF in `assets/papers/`
- `publications.html` briefings, work in progress, subscribe form
- `eastern-europe-logistics.html` briefing (April 26, 2026)
- `about.html` bio, education, leadership, recognition, research focus
- `support-ukraine.html` donation links
- `contact.html` email, LinkedIn, message form (opens an email draft)
- `404.html` page not found
- `assets/` stylesheet, script, icons

The font (Literata) loads from Google Fonts.

## Deploy (GitHub → Vercel)
1. In the `olehtsumbek1/website` repository, replace the old files with the contents of this folder.
   Old files this version doesn't use (the video, `fx-poster.svg`, the previous paper) can be removed
   from the repository if you want them gone.
2. Commit and push. Vercel redeploys automatically (`vercel.json` keeps clean URLs, e.g. `/about`).
3. Submit the subscribe form once on the live site to confirm FormSubmit still delivers to
   olt49@pitt.edu.

To use your own PDF of the paper, replace `assets/papers/what-the-satellites-miss-tsumbek.pdf` with a file of the same name.
