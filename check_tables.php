<?php
try {
    $pdo = new PDO('pgsql:host=127.0.0.1;port=5432;dbname=dbisabel2', 'postgres', 'postgres');
    $stmt = $pdo->query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
    echo "Tablas en dbisabel2:\n";
    echo "==================\n";
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- " . $row['tablename'] . "\n";
    }
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}
