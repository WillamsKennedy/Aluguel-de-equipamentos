<?php

declare(strict_types=1);

namespace Rental\Infrastructure\PDF;

use Dompdf\Dompdf;
use Dompdf\Options;
use Rental\Domain\Client\Client;
use Rental\Domain\Equipment\Equipment;
use Rental\Domain\Reservation\Reservation;

final class DomPdfContractGenerator implements ContractGeneratorInterface
{
    public function __construct(
        private readonly string $storageDir
    ) {
        if (!is_dir($storageDir)) {
            mkdir($storageDir, 0755, true);
        }
    }

    public function generate(Reservation $reservation, Client $client, Equipment $equipment): string
    {
        $html = $this->buildHtml($reservation, $client, $equipment);

        $options = new Options();
        $options->set('defaultFont', 'DejaVu Sans');

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $filename = sprintf('contrato_%s.pdf', $reservation->getId());
        $path     = rtrim($this->storageDir, '/') . '/' . $filename;

        file_put_contents($path, $dompdf->output());

        return $path;
    }

    private function buildHtml(Reservation $reservation, Client $client, Equipment $equipment): string
    {
        $period   = $reservation->getPeriod();
        $value    = $reservation->getValue();
        $document = $client->getDocument();

        return sprintf(
            '<!DOCTYPE html><html><head><meta charset="UTF-8">
            <style>
                body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
                h1   { font-size: 18px; text-align: center; }
                table { width: 100%%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ccc; padding: 8px; }
                th { background: #f0f0f0; }
                .total { font-weight: bold; font-size: 14px; }
            </style>
            </head><body>
            <h1>CONTRATO DE ALUGUEL DE EQUIPAMENTOS</h1>
            <p><strong>Número da Reserva:</strong> %s</p>
            <h2>DADOS DO CLIENTE</h2>
            <table>
                <tr><th>Nome</th><td>%s</td></tr>
                <tr><th>Documento</th><td>%s</td></tr>
                <tr><th>E-mail</th><td>%s</td></tr>
                <tr><th>Telefone</th><td>%s</td></tr>
                <tr><th>Endereço</th><td>%s</td></tr>
            </table>
            <h2>DADOS DO EQUIPAMENTO</h2>
            <table>
                <tr><th>Nome</th><td>%s</td></tr>
                <tr><th>Categoria</th><td>%s</td></tr>
                <tr><th>Número de Série</th><td>%s</td></tr>
            </table>
            <h2>PERÍODO E VALORES</h2>
            <table>
                <tr><th>Data de Início</th><td>%s</td></tr>
                <tr><th>Data de Término</th><td>%s</td></tr>
                <tr><th>Dias</th><td>%d</td></tr>
                <tr><th>Valor Diário</th><td>R$ %.2f</td></tr>
                <tr class="total"><th>Valor Total</th><td>R$ %.2f</td></tr>
                <tr class="total"><th>Caução (20%%)</th><td>R$ %.2f</td></tr>
            </table>
            <p style="margin-top:60px;">_____________________________&nbsp;&nbsp;&nbsp;
               _____________________________<br>
               Assinatura do Cliente&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               Assinatura da Empresa</p>
            </body></html>',
            htmlspecialchars($reservation->getId()),
            htmlspecialchars($client->getName()),
            htmlspecialchars((string)$document),
            htmlspecialchars($client->getEmail()->getValue()),
            htmlspecialchars($client->getPhone()),
            htmlspecialchars($client->getAddress()),
            htmlspecialchars($equipment->getName()),
            htmlspecialchars($equipment->getCategory()),
            htmlspecialchars($equipment->getSerialNumber()),
            $period->getStartDate()->format('d/m/Y'),
            $period->getEndDate()->format('d/m/Y'),
            $value->getDays(),
            $value->getDailyRate(),
            $value->getTotal(),
            $value->getDeposit()
        );
    }
}
