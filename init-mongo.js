db.createUser(
    {
        user: "mguser",
        pwd: "mgpass",
        roles: [
            {
                role: "readWrite",
                db: "filesharing"
            }
        ]
    }
);