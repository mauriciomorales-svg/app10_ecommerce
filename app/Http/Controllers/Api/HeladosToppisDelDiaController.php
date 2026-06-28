<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\HeladosToppisDelDiaService;

class HeladosToppisDelDiaController extends Controller
{
    /**
     * GET /api/tienda/helados/toppis-del-dia
     * Cartel mostrador — golosinas minimarket FEFO para coronar helados.
     */
    public function show()
    {
        return response()->json(HeladosToppisDelDiaService::block(), 200, [], JSON_UNESCAPED_UNICODE);
    }
}
