"use client"

import { getSession, useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import TimeCard from "./Timecard";
import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import { Button } from "@/components/ui/button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket, faCircleUser } from '@fortawesome/free-solid-svg-icons'









const cities = [
  "Asia/Dhaka",
  "Europe/Paris",
  "Australia/Canberra",
  "America/New_York",
  "Europe/London",
  "Asia/Riyadh",

  // Add more cities as needed
];
export default function Navbar({ navFor, shortNote }) {
  const { data: session } = useSession();
  const signOutHandle = () => {
    signOut({ callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/login` });
  };

  const [isDesktop, setIsDesktop] = useState(true);

  // Function to handle media query changes
  const handleMediaQueryChange = (mediaQuery) => {
    setIsDesktop(mediaQuery.matches);
  };

  useEffect(() => {
    // Set up the media query
    const mediaQuery = window.matchMedia("(min-width: 1400px)");
    setIsDesktop(mediaQuery.matches); // Initial state

    // Attach event listener for media query changes
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    // Clean up by removing event listener
    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  const renderTimeCards = () => {
    // Render time cards only if it's a desktop screen
    if (isDesktop) {
      return (
        <ul className="flex items-center space-x-2">
          {cities.map((city, index) => (
            <li className="mx-1 w-30" key={index}>
              <TimeCard city={city} />
            </li>
          ))}
        </ul>
      );
    }
    return null; // Return null if not a desktop screen
  };

  return (
    <>
      <nav className="bg-inherit drop-shadow-md">
        <div className="p-2 justify-between flex flex-columm">
          <Link className="flex items-center" href="/" passHref>

            <Image
              priority
              src="/images/NEW-SCH-logo-text-grey.png"
              alt="Logo"
              width={120}
              height={80}
              className="inline-block me-2"
            />
            <h1 style={{ fontSize: "18px" }} className="mt-3 font-semibold">Studio Click House Ltd.</h1>

          </Link>

          {renderTimeCards()}
          <div className="flex gap-x-0.5">
            <Button asChild
              className="mt-4 ml-3"
              variant="default"
              size="default"
            >
              <Link href="/account"><FontAwesomeIcon className="px-1" icon={faCircleUser} /> Account</Link>
            </Button>
            <Button
              onClick={signOutHandle}
              variant="destructive"
              size="default"
              className="mt-4 ml-3"
            >
              <FontAwesomeIcon className="px-1" icon={faRightFromBracket} /> Logout
            </Button>

          </div>

        </div>
      </nav>

      <div className={`px-5 navigation bg-foreground ${styles["nav"]}`}>
        {session.user.role !== "marketer" ? (
          <Link
            className={`${styles.navitem} ${navFor === "orders" ? styles.active : ""
              }`}
            href="/"
          >
            Orders
          </Link>
        ) : null}

        {session.user.role !== "user" && session.user.role !== "marketer" ? (
          <Link
            className={`${styles.navitem} ${navFor === "browse" ? styles.active : ""
              }`}
            href="/browse"
          >
            Browse
          </Link>
        ) : null}

        {session.user.role === "admin" || session.user.role === "super" ? (
          <li
            className={`${styles.navitem} ${navFor === "admin" ? styles.active : ""
              } `}
          >
            <li
              className="nav-link dropdown-toggle"
              id="navbarDropdownMenuLink"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Admin
            </li>
            <ul
              className="dropdown-menu"
              aria-labelledby="navbarDropdownMenuLink"
            >
              <li>
                <Link
                  className={`dropdown-item ${styles.dropitem}`}
                  href="/admin/users"
                >
                  Users
                </Link>
              </li>
              <li>
                <Link
                  className={`dropdown-item ${styles.dropitem}`}
                  href="/admin/tasks"
                >
                  Tasks
                </Link>
              </li>
              <li>
                <Link
                  className={`dropdown-item ${styles.dropitem}`}
                  href="/admin/clients"
                >
                  Clients
                </Link>
              </li>
            </ul>
          </li>
        ) : null}

        {session.user.role === "super" ? (
          <li
            className={`${styles.navitem} ${navFor === "dashboard" ? styles.active : ""
              } `}
          >
            <li
              className="nav-link dropdown-toggle"
              id="navbarDropdownMenuLink"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Dashboard
            </li>
            <ul
              className="dropdown-menu"
              aria-labelledby="navbarDropdownMenuLink"
            >
              <li>
                <Link
                  className={`dropdown-item ${styles.dropitem}`}
                  href="/dashboard/approvals"
                >
                  Approvals
                </Link>
              </li>
              <li className="dropdown-submenu">
                <li
                  className={`dropdown-item dropdown-toggle ${styles.dropitem}`}
                >
                  Invoice
                </li>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className={`dropdown-item ${styles.dropitem}`}
                      href="/dashboard/invoice/create"
                    >
                      Create
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={`dropdown-item ${styles.dropitem}`}
                      href="/dashboard/invoice/browse"
                    >
                      Browse
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        ) : null}

        {session.user.role === "admin" || session.user.role === "super" ? (
          <Link
            className={`${styles.navitem} ${navFor === "fileflow" ? styles.active : ""
              }`}
            href="/file-flow"
          >
            File Flow
          </Link>
        ) : null}

        {session.user.role === "admin" || session.user.role === "super" ? (
          <li
            className={`${styles.navitem} ${navFor === "crm" ? styles.active : ""
              } `}
          >
            <li
              className="nav-link dropdown-toggle"
              id="navbarDropdownMenuLink"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <Link
                href={
                  session.user.role === "marketer"
                    ? `/crm/marketers`
                    : "/crm/marketers"
                }
              >
                CRM
              </Link>
            </li>

            <ul
              className="dropdown-menu"
              aria-labelledby="navbarDropdownMenuLink"
            >
              <li>
                <Link
                  className={`dropdown-item ${styles.dropitem}`}
                  href="/crm/marketers"
                >
                  Marketers
                </Link>
              </li>
              <li>
                <Link
                  className={`dropdown-item ${styles.dropitem}`}
                  href="/crm/reports-database"
                >
                  Call Reports
                </Link>
              </li>
            </ul>
          </li>
        ) : null}

        {session.user.role === "marketer" ? (
          <>
            <Link
              className={`${styles.navitem} ${navFor === "marketers" ? styles.active : ""
                }`}
              href="/crm/marketers"
            >
              Marketers
            </Link>
            <Link
              className={`${styles.navitem} ${navFor === "call-reports" ? styles.active : ""
                }`}
              href="/crm/reports-database"
            >
              Call Reports
            </Link>

            <Link
              className={`${styles.navitem} ${navFor === "call-report-submit" ? styles.active : ""
                }`}
              href={`/crm/marketer/report?name=${session.user.name}`}
            >
              Call Report Submit
            </Link>
          </>
        ) : null}

        {shortNote ? (
          <div style={{ color: "white" }} className="pt-2 px-2 text-right ml-auto">
            {shortNote}
          </div>
        ) : (
          <div style={{ color: "white" }} className="pt-2 px-2 text-right ml-auto">
            Have a good day!
          </div>
        )}
      </div>





      <style jsx>
        {`
          @media (min-width: 992px) {
            .navbar-nav.time-cards-list {
              margin: none;
            }
          }

          li:hover > ul.dropdown-menu {
            display: block;
            color: white;
          }
          div.navigation ul.dropdown-menu {
            background-color: #343a40;
          }
          .dropdown-submenu {
            position: relative;
          }
          .dropdown-submenu > .dropdown-menu {
            top: 0;
            left: 100%;
            margin-top: -6px;
          }

          .dropdown-menu > li > a:hover:after {
            text-decoration: underline;
            transform: rotate(-90deg);
          }
        `}
      </style>
    </>
  );
}
