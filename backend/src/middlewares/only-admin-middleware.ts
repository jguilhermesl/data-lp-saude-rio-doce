export function onlyAdminMiddleware(req: any, res: any, next: any) {
  const userRole: string = req.userState.role;
  const adminType: string = req.userState.adminType;

  // Only allow admin with DEFAULT type (not SELLER)
  if (userRole !== "admin" && adminType !== "SELLER") {
    return res.status(403).send({
      error: "Forbidden. Only administrators have access to this resource."
    });
  }

  return next();
}
