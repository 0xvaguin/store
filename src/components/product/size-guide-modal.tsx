"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SizeGuideModalProps {
  modelagem?: string;
}

const SIZE_CHART = [
  { size: "PP", bust: "80 – 84", waist: "62 – 66", hip: "88 – 92", br: "34 – 36" },
  { size: "P", bust: "85 – 89", waist: "67 – 71", hip: "93 – 97", br: "38" },
  { size: "M", bust: "90 – 95", waist: "72 – 77", hip: "98 – 103", br: "40 – 42" },
  { size: "G", bust: "96 – 102", waist: "78 – 84", hip: "104 – 110", br: "44" },
];

export function SizeGuideModal({ modelagem }: SizeGuideModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
      >
        <Ruler className="size-3.5" />
        <span>Guia de Medidas</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold tracking-wide uppercase">
              Guia de Medidas — AURA
            </DialogTitle>
            <DialogDescription>
              Medidas corporais de referência em centímetros (cm) para auxiliar
              na escolha do seu tamanho ideal.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b bg-muted/60 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  <th className="px-3 py-2.5">Tamanho</th>
                  <th className="px-3 py-2.5">Busto (cm)</th>
                  <th className="px-3 py-2.5">Cintura (cm)</th>
                  <th className="px-3 py-2.5">Quadril (cm)</th>
                  <th className="px-3 py-2.5">Manequim</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {SIZE_CHART.map((row) => (
                  <tr
                    key={row.size}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-3 py-2.5 font-semibold text-foreground">
                      {row.size}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {row.bust}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {row.waist}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {row.hip}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {row.br}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border bg-secondary/40 p-3.5 text-xs leading-relaxed text-muted-foreground">
            <p className="font-semibold text-foreground">Dica de Modelagem</p>
            <p className="mt-1">
              {modelagem
                ? `Esta peça possui modelagem "${modelagem}". `
                : ""}
              Para medir corretamente, mantenha a fita métrica rente ao corpo sem
              apertar. Se suas medidas estiverem entre dois tamanhos, opte pelo
              menor para um caimento mais justo ou pelo maior para um visual mais
              solto e confortável.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
