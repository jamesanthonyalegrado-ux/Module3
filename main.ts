import {
  EnrollmentStatus,
  computeAverage
} from "./gradeUtils";

import getStatus from "./gradeUtils";

interface Enrollee {
  name: string;
  prelim: number;
  midterm: number;
  final: number;
}

type EligibilityReport = {
  name: string;
  average: number;
  status: EnrollmentStatus;
  remarks?: string;
};

const enrollees: Enrollee[] = [
  {
    name: "Ana Cruz",
    prelim: 85,
    midterm: 90,
    final: 88
  },
  {
    name: "Bea Santos",
    prelim: 70,
    midterm: 65,
    final: 60
  },
  {
    name: "Cid Ramos",
    prelim: 95,
    midterm: 92,
    final: 97
  },
  {
    name: "Dex Alonzo",
    prelim: 60,
    midterm: 55,
    final: 50
  },
  {
    name: "Eli Tan",
    prelim: 78,
    midterm: 80,
    final: 76
  }
];

function getEnrollees(): Promise<Enrollee[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const connectionSuccessful = true;

      if (connectionSuccessful) {
        resolve(enrollees);
      } else {
        reject(new Error("Unable to connect to registrar API."));
      }
    }, 500);
  });
}

function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  return items.reduce(
    (groups: Record<string, T[]>, item: T) => {
      const key = keyFn(item);

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(item);

      return groups;
    },
    {}
  );
}

async function generateReport(): Promise<void> {
  try {
    const data: Enrollee[] = await getEnrollees();

    const batchId: string = "BATCH-2026-01";
    console.log(`Batch ID: ${batchId}`);

    const reports: EligibilityReport[] = data.map(
      (enrollee: Enrollee): EligibilityReport => {
        const average: number = computeAverage(
          enrollee.prelim,
          enrollee.midterm,
          enrollee.final
        );

        const status: EnrollmentStatus = getStatus(average);

        const report: EligibilityReport = {
          name: enrollee.name,
          average: average,
          status: status
        };

        if (status === EnrollmentStatus.Probation) {
          report.remarks = "Needs consultation";
        }

        return report;
      }
    );

    const classAverage: number =
      reports.reduce(
        (sum: number, report: EligibilityReport) =>
          sum + report.average,
        0
      ) / reports.length;

    const groupedReports: Record<string, EligibilityReport[]> =
      groupBy(
        reports,
        (report: EligibilityReport): string => report.status
      );

    const passingCount: number =
      groupedReports[EnrollmentStatus.Passing]?.length ?? 0;

    console.log(
      "\n=== IT313 Enrollment Eligibility Report (TypeScript) ==="
    );

    reports.forEach((report: EligibilityReport): void => {
      let line: string =
        `${report.name} - Average: ${report.average.toFixed(2)} - ${report.status}`;

      if (report.remarks) {
        line += ` - ${report.remarks}`;
      }

      console.log(line);
    });

    console.log(`Class Average: ${classAverage.toFixed(2)}`);
    console.log(`Passing: ${passingCount} / ${reports.length}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Registrar connection failed: ${error.message}`);
    } else {
      console.error("An unknown error occurred.");
    }
  }
}

generateReport();