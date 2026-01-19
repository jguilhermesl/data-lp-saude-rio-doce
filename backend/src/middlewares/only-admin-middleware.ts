export function onlyAdminMiddleware(req: any, res: any, next: any) {
  const userRole: string = req.userState?.role;

  // Only allow users with ADMIN role
  if (userRole !== "ADMIN") {
    return res.status(403).send({
      error: "Forbidden. Only administrators have access to this resource."
    });
  }

  return next();
}
