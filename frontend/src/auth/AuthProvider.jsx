import React from "react";
import { AuthProvider as OidcProvider } from "react-oidc-context";
import { oidcConfig } from "./oidcConfig";

export default function AuthProvider({ children }) {
  return <OidcProvider {...oidcConfig}>{children}</OidcProvider>;
}
