void import("./.next/server/app/page.js")
  .then(() => {
    console.log("Loaded compiled app page module.");
  })
  .catch((error) => {
    console.error("Unable to load compiled app page module.", error);
  });
