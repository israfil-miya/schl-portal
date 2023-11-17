import React from "react";
import Moment from "react-moment";
import "moment-timezone";

const TimeCard = ({ city }) => {
  return (
    <>
      <div className="card border shadow-sm custom-card">
        <div className="card-header fw-light bg-dark px-2 py-0 text-center custom-card-header">
          {city
            .split("/")[1]
            .replace("_", " ")
            .replace("Paris", "CET")
            .replace("Riyadh", "GULF")
            .replace("Canberra", "Australia")}
        </div>
        <div className=" text-center bg-light card-body py-0">
          <span className="fw-medium">
            <Moment format="hh:mm A" interval={1000} tz={city} />
          </span>
        </div>
      </div>

      <style jsx>
        {`
          .custom-card {
            overflow: hidden;
            word-wrap: break-word;
            word-break: normal;
            hyphens: auto;
            border-radius: 0 0 20px 0;
          }

          .custom-card-header {
            font-size: 14px;
            color: white;
            border-radius: 5px 0 0 0;
          }
        `}
      </style>
    </>
  );
};

export default TimeCard;