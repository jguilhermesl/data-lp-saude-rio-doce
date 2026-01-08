export function isAdminMiddleware(req: any, res: any, next: any) {
  const userRole: string = req.userState.role

  if (!(userRole === "admin" || userRole === "seller")) {
    return res.status(401).send({
      error: "Unauthorized."
    })
  }

  return next();
}