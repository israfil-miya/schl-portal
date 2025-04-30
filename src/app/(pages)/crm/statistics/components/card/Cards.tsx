'use client';

import React from 'react';

import Card from './Card';

import { CirclePause, FlaskConical, Lightbulb, Signature } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';

const Cards = () => {
  const router = useRouter();

  return (
    <div className="sm:flex grid grid-cols-2 gap-4 justify-between px-2">
      <Card
        title="Trial Clients"
        description="Clients that placed test orders but haven't converted to regular customers."
        onClick={() =>
          router.push(process.env.NEXT_PUBLIC_BASE_URL + '/crm/trial-clients')
        }
        icon={
          <FlaskConical size={32} className="text-primary stroke-primary" />
        }
      />
      <Card
        title="Pending Prospects"
        description="Prospects contacted over 2 months ago who haven't converted to regular customers and didn't give any test."
        onClick={() =>
          router.push(
            process.env.NEXT_PUBLIC_BASE_URL + '/crm/pending-prospects',
          )
        }
        icon={<CirclePause size={32} className="text-primary stroke-primary" />}
      />
      {/* Here leads doesn't actually mean leads, it shows call reports with high conversion potential. in short, prospects */}
      <Card
        title="Potential Leads"
        description="Leads with high conversion potential."
        onClick={() =>
          router.push(process.env.NEXT_PUBLIC_BASE_URL + '/crm/potential-leads')
        }
        icon={<Lightbulb size={32} className="text-primary stroke-primary" />}
      />
      <Card
        title="Client Approvals"
        description="Review call reports to approve regular clients."
        onClick={() =>
          router.push(
            process.env.NEXT_PUBLIC_BASE_URL + '/crm/client-approvals',
          )
        }
        icon={<Signature size={32} className="text-primary stroke-primary" />}
      />
    </div>
  );
};

export default Cards;
