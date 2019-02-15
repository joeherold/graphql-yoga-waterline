import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import csrf from "csurf";

const prepareExpress = (expressApp, dawnship) => {
  // code here

  // add cookie parser
  expressApp.use(cookieParser());

  if (dawnship.config.security.csrf === true) {
    // add csrf
    let csrfProtection = csrf({ cookie: true });
    expressApp.use(csrfProtection, (req, res, next) => {
      res.csrfToken = req.csrfToken();
      next();
    });
  }

  expressApp.use(function(req, res, next) {
    res.setHeader("X-Powered-By", "Graphql Yoga Waterline Server");
    next();
  });
};

export default prepareExpress;
