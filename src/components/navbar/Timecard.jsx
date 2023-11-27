import React from "react";
import Moment from "react-moment";
import "moment-timezone";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import styles from "./Navbar.module.css";

const TimeCard = ({ city }) => {
  return (
    <>
      <Card className={`rounded-none ${styles.customcard}`}>
        <CardHeader className={`fw-light text-white bg-foreground text-background px-2 py-0 text-center  ${styles.customcardheader}`}>
          {city
            .split("/")[1]
            .replace("_", " ")
            .replace("Paris", "CET")
            .replace("Riyadh", "GULF")
            .replace("Canberra", "Australia")}
        </CardHeader>
        <CardContent className="text-center bg-background text-forground card py-0">
          <span className="fw-medium">
            <Moment format="hh:mm A" interval={1000} tz={city} />
          </span>
        </CardContent>
      </Card>
    </>
  );
};

export default TimeCard;