import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const email = req.query.email;
  const password = req.query.password;
  console.log(email, password);
  console.log(req.query);
  try {
    const response = await prisma.user.findUnique({
      where: {
        email: email,
        password: password,
      },
    });
    console.log(response);
    res.status(200).json(response); // Set status 200 for successful response
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Failed to fetch users" }); // Set status 500 for server errors
  }
}
