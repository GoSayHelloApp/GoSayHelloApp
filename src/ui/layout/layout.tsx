import { useRoutes } from "react-router-dom";
import { useEffect } from "react";
import { useLoadAppConfigMutation } from "../../services/appconfiguration/configApi";
import routes from "../../routes/routes";

function Layout() {
  const [loadAppConfig] = useLoadAppConfigMutation();

  useEffect(() => {
    loadAppConfig("");
  }, []);

  const routing = useRoutes(routes);

  return routing;
}

export default Layout;
