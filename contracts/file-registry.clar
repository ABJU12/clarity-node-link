;; File Registry Contract

;; Constants
(define-constant err-invalid-hash (err u200))
(define-constant err-file-exists (err u201))

;; Data structures
(define-map files
  { file-hash: (string-ascii 64) }
  {
    owner: principal,
    size: uint,
    name: (string-ascii 64),
    mime-type: (string-ascii 64),
    timestamp: uint,
    seeders: (list 100 principal)
  })

;; Public functions  
(define-public (register-file 
  (hash (string-ascii 64))
  (size uint)
  (name (string-ascii 64))
  (mime-type (string-ascii 64)))
  (let ((file { file-hash: hash }))
    (if (is-none (map-get? files file))
      (begin
        (map-set files file {
          owner: tx-sender,
          size: size,
          name: name,
          mime-type: mime-type,
          timestamp: block-height,
          seeders: (list tx-sender)
        })
        (ok true))
      err-file-exists)))

(define-public (add-seeder (hash (string-ascii 64)))
  (let ((file (unwrap! (map-get? files { file-hash: hash }) err-invalid-hash))
        (new-seeders (unwrap-panic (as-max-len? 
          (append (get seeders file) tx-sender) u100))))
    (map-set files { file-hash: hash }
      (merge file { seeders: new-seeders }))
    (ok true)))

;; Read only functions
(define-read-only (get-file (hash (string-ascii 64)))
  (map-get? files { file-hash: hash }))
