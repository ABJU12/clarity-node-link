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

Clarinet.test({
  name: "Ensure can update node reputation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;
    
    let block = chain.mineBlock([
      Tx.contractCall("node-registry", "register-node",
        [types.uint(1000), types.ascii("US")],
        wallet1.address),
      Tx.contractCall("node-registry", "update-reputation",
        [types.principal(wallet1.address), types.int(10)],
        deployer.address)
    ]);
    
    assertEquals(block.receipts[1].result, '(ok true)');
    
    let nodeInfo = chain.callReadOnlyFn(
      "node-registry",
      "get-node",
      [types.principal(wallet1.address)],
      deployer.address
    );
    
    assertEquals(nodeInfo.result.expectSome().reputation, types.uint(10));
  },
});
