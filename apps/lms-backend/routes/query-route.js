const router = require("express").Router();
const { queryControllers } = require("../controllers");
const { multerMiddleware } = require("../middleware");

// --- Query Core Endpoints ---
router
  .route("/")
  .get(queryControllers.getFilteredQueries)
  .post(multerMiddleware.single, queryControllers.createQuery);

router
  .route("/:query_uuid")
  .get(queryControllers.getQueryByUUID)
  .put(queryControllers.updateQuery)
  .delete(queryControllers.deleteQuery);

router.patch("/:query_uuid/status", queryControllers.changeQueryStatus);

// --- Query Messages Endpoints ---
router
  .route("/:query_uuid/messages")
  .get(queryControllers.getQueryMessages)
  .post(multerMiddleware.single, queryControllers.createQueryMessage);

router.patch(
  "/:query_uuid/messages/:message_uuid",
  queryControllers.updateQueryMessage,
);
router.delete(
  "/:query_uuid/messages/:message_uuid",
  queryControllers.deleteQueryMessage,
);

// --- Attachments Endpoints ---
router.post(
  "/:query_uuid/attachments",
  multerMiddleware.single,
  queryControllers.addAttachment,
);
router.delete(
  "/:query_uuid/messages/:message_uuid/attachment",
  queryControllers.removeAttachment,
);

// --- Query Members Endpoints ---
router
  .route("/:query_uuid/members")
  .get(queryControllers.getQueryMembers)
  .post(queryControllers.addMember);

router.delete(
  "/:query_uuid/members/:member_uuid",
  queryControllers.removeMember,
);

module.exports = router;
