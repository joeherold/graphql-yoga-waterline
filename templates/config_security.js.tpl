/**
 * Security Settings
 *
 * These settings affect aspects of your app's security, such
 * as how it deals with cross-origin requests (CORS) and which
 * routes require a CSRF token to be included with the request.
 *
 * For an overview of how Sails handles security, see:
 * https://sailsjs.com/documentation/concepts/security
 *
 * For additional options and more information, see:
 * https://sailsjs.com/config/security
 */

module.exports.security = {
  /***************************************************************************
   *                                                                          *
   * CORS is like a more modern version of JSONP-- it allows your application *
   * to circumvent browsers' same-origin policy, so that the responses from   *
   * your Graphql app hosted on one domain (e.g. example.com) can be received *
   * in the client-side JavaScript code from a page you trust hosted on _some *
   * other_ domain (e.g. trustedsite.net).                                    *
   *                                                                          *
   * For additional options and more information, see:                        *
   * https://github.com/expressjs/cors#configuration-options                  *
   *                                                                          *
   ***************************************************************************/

  cors: {
    /**
     * Configures the Access-Control-Allow-Origin CORS header. Possible values:
     *
     * - Boolean - set origin to true to reflect the request origin, as defined
     *   by req.header('Origin'), or set it to false to disable CORS.
     *
     * - String - set origin to a specific origin. For example if you set it
     *   to "http://example.com" only requests from "http://example.com" will
     *   be allowed.
     *
     * - RegExp - set origin to a regular expression pattern which will be used
     *   to test the request origin. If it's a match, the request origin will be
     *   reflected. For example the pattern /example\.com$/ will reflect any
     *   request that is coming from an origin ending with "example.com".
     *
     * - Array - set origin to an array of valid origins. Each origin can be a
     *   String or a RegExp. For example ["http://example1.com", /\.example2\.com$/]
     *   will accept any request from "http://example1.com" or from a subdomain
     *   of "example2.com".
     *
     * - Function - set origin to a function implementing some custom logic.
     *   The function takes the request origin as the first parameter and a
     *   callback (which expects the signature err [object], allow [bool])
     *   as the second.
     *
     */
    origin: true

    /**
     * Configures the Access-Control-Allow-Methods CORS header. Expects a
     * comma-delimited string (ex: 'GET,PUT,POST') or an array
     * (ex: ['GET', 'PUT', 'POST']).
     */
    // methods: ['GET', 'PUT', 'POST'],

    /**
     * Configures the Access-Control-Allow-Headers CORS header. Expects a
     * comma-delimited string (ex: 'Content-Type,Authorization') or an array
     * (ex: ['Content-Type', 'Authorization']). If not specified, defaults to
     * reflecting the headers specified in the request's
     * Access-Control-Request-Headers header.
     */
    // allowedHeaders: ['Content-Type', 'Authorization'],

    /**
     * Configures the Access-Control-Expose-Headers CORS header. Expects a
     * comma-delimited string (ex: 'Content-Range,X-Content-Range') or an
     * array (ex: ['Content-Range', 'X-Content-Range']). If not specified,
     * no custom headers are exposed.
     */
    // exposedHeaders: ['Content-Range', 'X-Content-Range'],

    /**
     * Configures the Access-Control-Allow-Credentials CORS header.
     * Set to true to pass the header, otherwise it is omitted.
     */
    // credentials: true,

    /**
     * Configures the Access-Control-Max-Age CORS header. Set to an
     * integer to pass the header, otherwise it is omitted.
     */
    // maxAge: 0,

    /**
     * Pass the CORS preflight response to the next handler.
     */
    // preflightContinue: false,

    /**
     * Provides a status code to use for successful OPTIONS requests,
     * since some legacy browsers (IE11, various SmartTVs) choke on 204.
     */
    // optionsSuccessStatus: 204
  },

  /****************************************************************************
   *                                                                           *
   * CSRF protection should be enabled for this application.                   *
   *                                                                           *
   * For more information, see:                                                *
   * https://sailsjs.com/docs/concepts/security/csrf                           *
   *                                                                           *
   ****************************************************************************/

  csrf: false
};
