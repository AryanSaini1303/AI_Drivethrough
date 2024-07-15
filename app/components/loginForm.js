import styles from "./loginForm.module.css";
import Image from "next/image";
export default function LoginForm() {
  return (
    <>
      <form action="" method="post" className={styles.inputForm}>
        <Image
          src="/user.svg"
          alt="user"
          width={25}
          height={25}
          className={styles.user}
        />
        <input
          type="text"
          name="username"
          id="username"
          placeholder="Username"
          required
        />
        <Image
          src="/email.svg"
          alt="user"
          width={24}
          height={24}
          className={styles.email}
        />
        <input
          type="email"
          name="email"
          id="email"
          placeholder="E-mail"
          required
        />
        <Image
          src="/password.svg"
          alt="user"
          width={25}
          height={25}
          className={styles.password}
        />
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Password"
          required
        />
        <button type="submit">Log in</button>
        <h6 className={styles.forgPass}>Forgot Password?</h6>
      </form>
      <h6 className={styles.account}>Create a new account?</h6>
    </>
  );
}
