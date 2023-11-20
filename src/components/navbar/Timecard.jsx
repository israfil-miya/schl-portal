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

import style from "./style.css";

const TimeCard = ({ city }) => {
  return (
    <>
      <Card className={`border rounded-none drop-shadow-sm custom-card ${style.customcard}`}>
        <CardHeader className={`fw-light bg-slate-950 text-white px-2 py-0 text-center custom-card-header ${style.customcardheader}`}>
          {city
            .split("/")[1]
            .replace("_", " ")
            .replace("Paris", "CET")
            .replace("Riyadh", "GULF")
            .replace("Canberra", "Australia")}
        </CardHeader>
        <CardContent className="text-center bg-light card py-0">
          <span className="fw-medium">
            <Moment format="hh:mm A" interval={1000} tz={city} />
          </span>
        </CardContent>
      </Card>
    </>
  );
};

export default TimeCard;