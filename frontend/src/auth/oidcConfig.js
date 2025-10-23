export const oidcConfig = {
  authority: "https://localhost:9443/oauth2/oidcdiscovery", // ✅ use the working discovery endpoint
  client_id: "uR9rm5xmIaEbI6QAqQW24iE15XAa",               // ✅ your WSO2 client ID
  client_secret: "kElNfDIBdSXUSfXUThScMvFoxRY0RweyugKsjVIZrmga", // ✅ your WSO2 client secret
  redirect_uri: "https://localhost:5173/callback",           // ✅ must match the Redirect URL in WSO2
  post_logout_redirect_uri: "https://localhost:5173/",
  response_type: "code",
  scope: "openid email profile",
  loadUserInfo: true,
  automaticSilentRenew: false,
};
