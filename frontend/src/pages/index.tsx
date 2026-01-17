import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/react";

import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { apiService } from "@/services/api";
import { EyeIcon } from "@/components/icons";

export default function IndexPage() {
  const [stats, setStats] = useState({ tables: 0, records: 0 });
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const tableList = await apiService.getTables();
        setTables(tableList);

        let totalRecords = 0;
        for (const table of tableList) {
          const data = await apiService.getTableData(table);
          totalRecords += data.length;
        }

        setStats({
          tables: tableList.length,
          records: totalRecords
        });
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-8 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <span className={title()}>Dynamic&nbsp;</span>
          <span className={title({ color: "violet" })}>Database&nbsp;</span>
          <br />
          <span className={title()}>
            Manager with SQLite
          </span>
          <div className={subtitle({ class: "mt-4" })}>
            Monitor and manage your SQLite data. <br /> (Basic CRUD Boilerplate)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4">
          <Card className="bg-default-50 border-none shadow-sm">
            <CardBody className="flex flex-col items-center py-6">
              <p className="text-4xl font-bold text-primary">{loading ? "..." : stats.tables}</p>
              <p className="text-default-500 font-medium">Total Tables</p>
            </CardBody>
          </Card>
          <Card className="bg-default-50 border-none shadow-sm">
            <CardBody className="flex flex-col items-center py-6">
              <p className="text-4xl font-bold text-secondary">{loading ? "..." : stats.records}</p>
              <p className="text-default-500 font-medium">Total Records</p>
            </CardBody>
          </Card>
        </div>

        <div className="w-full max-w-2xl px-4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Quick Access</h2>
            <Link
              className={buttonStyles({
                color: "primary",
                variant: "flat",
                size: "sm",
                radius: "full",
              })}
              href="/tables"
            >
              See All Tables
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tables.slice(0, 4).map((table) => (
              <Card key={table} as={Link} href={`/tables/${table}`} isPressable className="hover:bg-default-100 transition-colors">
                <CardBody className="flex flex-row items-center justify-between px-4 py-3">
                  <span className="font-semibold">{table}</span>
                  <EyeIcon className="text-default-400" />
                </CardBody>
              </Card>
            ))}
            {!loading && tables.length === 0 && (
              <p className="text-default-400 text-center col-span-2">No tables created yet. Go to Tables to start.</p>
            )}
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
