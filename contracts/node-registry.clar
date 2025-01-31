;; Node Registry Contract

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-owner (err u100))
(define-constant err-already-registered (err u101))
(define-constant err-not-registered (err u102))
(define-constant err-invalid-reputation (err u103))

;; Data vars
(define-map nodes 
  { node-address: principal } 
  { 
    storage-capacity: uint,
    location: (string-ascii 2),
    reputation: uint,
    total-shared: uint,
    is-active: bool,
    last-updated: uint
  }
)

(define-data-var total-nodes uint u0)

;; Public functions
(define-public (register-node (storage uint) (location (string-ascii 2)))
  (let ((node { node-address: tx-sender }))
    (if (is-none (map-get? nodes node))
      (begin
        (map-set nodes node {
          storage-capacity: storage,
          location: location,
          reputation: u0,
          total-shared: u0,
          is-active: true,
          last-updated: block-height
        })
        (var-set total-nodes (+ (var-get total-nodes) u1))
        (ok true))
      err-already-registered)))

(define-public (deactivate-node)
  (let ((node { node-address: tx-sender }))
    (if (is-some (map-get? nodes node))
      (begin 
        (map-set nodes node 
          (merge (unwrap-panic (map-get? nodes node))
            { is-active: false,
              last-updated: block-height }))
        (ok true))
      err-not-registered)))

(define-public (update-reputation (address principal) (delta int))
  (let ((node { node-address: address })
        (current-node (unwrap! (map-get? nodes node) err-not-registered))
        (new-rep (to-uint (+ (to-int (get reputation current-node)) delta))))
    (if (> new-rep u100)
      err-invalid-reputation
      (begin
        (map-set nodes node
          (merge current-node { 
            reputation: new-rep,
            last-updated: block-height
          }))
        (ok true)))))

;; Read only functions
(define-read-only (get-node (address principal))
  (map-get? nodes { node-address: address }))

(define-read-only (get-total-nodes)
  (ok (var-get total-nodes)))
