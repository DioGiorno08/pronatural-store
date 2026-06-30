import bcrypt from "bcryptjs";
const hash = "$2b$10$T4qGsB8zBnyE3/ZYJZW4zOrg1UjIDgnUowEgKixkWl2aZnw4.Ub9O";
bcrypt.compare("Palomamami01!", hash).then(res => console.log("Match: " + res));
