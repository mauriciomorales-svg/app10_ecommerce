<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CommerceEventService;
use Illuminate\Http\Request;

class CommerceEventController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'event' => 'required|string|max:64',
            'payload' => 'nullable|array',
            'session_id' => 'nullable|string|max:64',
            'page' => 'nullable|string|max:255',
        ]);

        CommerceEventService::track(
            $validated['event'],
            $validated['payload'] ?? [],
            $validated['session_id'] ?? null,
            $validated['page'] ?? null
        );

        return response()->json(['success' => true]);
    }
}
