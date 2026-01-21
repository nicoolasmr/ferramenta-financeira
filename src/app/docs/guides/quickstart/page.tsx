import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function QuickstartPage() {
    return (
        <div>
            <h1>Quickstart</h1>
            <p className="lead">Integre cobranças recorrentes no seu app em menos de 10 minutos.</p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
                <p className="text-yellow-800 text-sm m-0">
                    <strong>Ambiente de Teste:</strong> Enquanto desenvolve, use suas chaves de API iniciadas em <code>sk_test_</code>. Nenhuma cobrança real será processada.
                </p>
            </div>

            <h2>1. Obtenha sua API Key</h2>
            <p>
                Para autenticar suas requisições, você precisará da sua Secret Key.
                Acesse o <Link href="/dashboard/settings/api">Painel do Desenvolvedor</Link> e copie sua chave.
            </p>

            <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                <code>sk_test_51Mz...XyZ</code>
            </pre>

            <h2>2. Instale o SDK (Opcional)</h2>
            <p>Nossa biblioteca oficial facilita a integração, lidando com tipagem e tratamento de erros.</p>

            <div className="flex gap-4 mb-4">
                <div className="flex-1">
                    <p className="font-bold text-sm text-slate-600 mb-2">Node.js</p>
                    <pre className="bg-slate-100 text-slate-800 p-3 rounded border">
                        <code>npm install revenueos-node</code>
                    </pre>
                </div>
                <div className="flex-1">
                    <p className="font-bold text-sm text-slate-600 mb-2">Python</p>
                    <pre className="bg-slate-100 text-slate-800 p-3 rounded border">
                        <code>pip install revenueos</code>
                    </pre>
                </div>
            </div>

            <h2>3. Crie seu primeiro Cliente</h2>
            <p>Um "Customer" é a entidade que terá cartões e assinaturas atrelados.</p>

            <pre className="bg-slate-900 text-slate-50 p-6 rounded-xl overflow-x-auto text-sm leading-relaxed">
                {`const revenueos = require('revenueos')('sk_test_...');

const customer = await revenueos.customers.create({
  email: 'cliente@exemplo.com',
  name: 'João da Silva',
  payment_method: {
    type: 'credit_card',
    token: 'tok_visa' // Tokenizado no frontend
  }
});

console.log(customer.id); // "cus_123xyz"`}
            </pre>

            <h2>Próximos Passos</h2>
            <ul>
                <li><Link href="/docs/guides/api-reference">Explore a Referência da API</Link> para ver todos os endpoints.</li>
                <li><Link href="/docs/guides/webhooks">Configure Webhooks</Link> para ouvir eventos de pagamento.</li>
            </ul>
        </div>
    );
}
