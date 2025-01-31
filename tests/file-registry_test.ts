import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensure can register new file",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    
    let block = chain.mineBlock([
      Tx.contractCall("file-registry", "register-file",
        [
          types.ascii(hash),
          types.uint(1000),
          types.ascii("test.txt"),
          types.ascii("text/plain")
        ],
        deployer.address
      )
    ]);
    
    assertEquals(block.receipts[0].result, '(ok true)');
    
    let fileInfo = chain.callReadOnlyFn(
      "file-registry",
      "get-file", 
      [types.ascii(hash)],
      deployer.address
    );
    
    assertEquals(fileInfo.result.expectSome().owner, deployer.address);
  },
});
