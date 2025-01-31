import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensure can register new node",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    
    let block = chain.mineBlock([
      Tx.contractCall("node-registry", "register-node", 
        [types.uint(1000), types.ascii("US")], 
        deployer.address)
    ]);
    
    assertEquals(block.receipts[0].result, '(ok true)');
    
    let totalNodes = chain.callReadOnlyFn(
      "node-registry",
      "get-total-nodes",
      [],
      deployer.address  
    );
    
    assertEquals(totalNodes.result, '(ok u1)');
  },
});
