/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LogOutputChannel, SourceControlArtifactProvider, SourceControlArtifactGroup, SourceControlArtifact, Event, EventEmitter, ThemeIcon } from 'vscode';
import { IDisposable } from './util';
import { Repository } from './repository';

export class GitArtifactProvider implements SourceControlArtifactProvider, IDisposable {
	private readonly _onDidChangeArtifacts = new EventEmitter<string>();
	readonly onDidChangeArtifacts: Event<string> = this._onDidChangeArtifacts.event;

	private readonly _groups: SourceControlArtifactGroup[];

	constructor(
		private readonly repository: Repository,
		private readonly logger: LogOutputChannel
	) {
		this.logger.info('GitArtifactProvider initialized: ', this.repository.root);

		this._groups = [
			this._createArtifactGroup('branches', 'Branches', new ThemeIcon('git-branch')),
			this._createArtifactGroup('stashes', 'Stashes', new ThemeIcon('git-stash')),
			this._createArtifactGroup('tags', 'Tags', new ThemeIcon('tag'))
		];
	}
	provideArtifactGroups(): SourceControlArtifactGroup[] {
		return this._groups;
	}

	async provideArtifacts(group: string): Promise<SourceControlArtifact[]> {
		if (group === 'branches') {
			const refs = await this.repository.getRefs({ pattern: 'refs/heads', includeCommitDetails: true });

			return refs.map(r => ({
				id: `refs/heads/${r.name}`,
				name: r.name ?? r.commit ?? '',
				//description: r.commitDetails?.message
			}));
		} else if (group === 'stashes') {
			const stashes = await this.repository.getStashes();

			return stashes.map(s => ({
				id: `stash@{${s.index}}`,
				name: `#${s.index}: ${s.description}`,
				description: s.branchName
			}));
		} else if (group === 'tags') {
			const refs = await this.repository.getRefs({ pattern: 'refs/tags', includeCommitDetails: true });

			return refs.map(r => ({
				id: `refs/tags/${r.name}`,
				name: r.name ?? r.commit ?? '',
				//description: r.commitDetails?.message
			}));
		}

		return [];
	}

	private _createArtifactGroup(id: string, name: string, icon: ThemeIcon): SourceControlArtifactGroup {
		return { id, name, icon };
	}

	dispose(): void {
	}
}
